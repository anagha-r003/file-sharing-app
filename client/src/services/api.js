import axios from "axios";


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};


const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // sends refreshToken cookie automatically on every request
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Always send device ID so backend can track sessions per device
  config.headers["X-Device-Id"] = getOrCreateDeviceId();

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    // Only handle 401 and only retry once per request (_retry flag)
    if (error.response?.status === 401 && !original._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      // ── REFRESH PATH ─────────────────────────────────────────────────
      // We are the first 401. Take the lock and do the refresh.
      // ─────────────────────────────────────────────────────────────────
      original._retry = true;
      isRefreshing = true;

      try {
        
        const res = await axios.post(
          "http://localhost:8080/auth/refresh",
          {},
          { withCredentials: true }
        );

        // Backend returns: { data: { accessToken: "..." } }
        const newAccessToken = res.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        // Unblock all queued requests with the new token
        processQueue(null, newAccessToken);

        // Replay the original request that triggered the 401
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);

      } catch (refreshError) {
        // Refresh itself failed (token expired or revoked on backend).
        // Reject everything in the queue and force logout.
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);

      } finally {
        // Always release the lock, even if refresh threw
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;