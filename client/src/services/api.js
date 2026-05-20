import axios from "axios";

let refreshPromise = null;

// ─────────────────────────────────────────────
// Device ID
// ─────────────────────────────────────────────
const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
  }

  return deviceId;
};

// ─────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// ─────────────────────────────────────────────
// Request interceptor
// ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["X-Device-Id"] = getOrCreateDeviceId();

  return config;
});

// ─────────────────────────────────────────────
// Response interceptor
// ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    // No config → reject
    if (!original) {
      return Promise.reject(error);
    }

    // Skip refresh logic for auth endpoints
    const isAuthRoute =
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/logout") ||
      original.url?.includes("/auth/refresh");

    // Only refresh for protected APIs
    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;

      // If no refresh in flight, start one — otherwise all requests share the existing promise
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            "http://localhost:8080/auth/refresh",
            {},
            { withCredentials: true },
          )
          .then((res) => {
            const newAccessToken = res.data.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);
            return newAccessToken;
          })
          .catch((err) => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(err);
          })
          .finally(() => {
            refreshPromise = null; // reset so next expiry starts fresh
          });
      }

      try {
        // All concurrent 401s await the same promise — only 1 HTTP call fires
        const newAccessToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;