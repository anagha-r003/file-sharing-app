import axios from "axios";
import { isAccessTokenExpired } from "../utils/tokenUtils";

let refreshPromise = null;
let onSessionExpired = null;

const REFRESH_LOCK_KEY = "auth_refresh_lock";
const REFRESH_LOCK_TTL_MS = 15000;

// ─────────────────────────────────────────────
// Session expiry callback (registered by AuthContext)
// ─────────────────────────────────────────────
export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = handler;
};

const clearSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  onSessionExpired?.();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const getRefreshHeaders = () => ({
  "X-Device-Id": getOrCreateDeviceId(),
});

// ─────────────────────────────────────────────
// Cross-tab refresh coordination
// ─────────────────────────────────────────────
const isRefreshLockHeld = () => {
  const lockTs = localStorage.getItem(REFRESH_LOCK_KEY);
  if (!lockTs) return false;
  return Date.now() - Number(lockTs) < REFRESH_LOCK_TTL_MS;
};

const waitForCrossTabRefresh = async (tokenBefore) => {
  for (let i = 0; i < 100; i++) {
    await sleep(100);

    const currentToken = localStorage.getItem("accessToken");
    if (
      currentToken &&
      currentToken !== tokenBefore &&
      !isAccessTokenExpired(currentToken, 0)
    ) {
      return currentToken;
    }

    if (!isRefreshLockHeld()) {
      break;
    }
  }

  const finalToken = localStorage.getItem("accessToken");
  if (finalToken && !isAccessTokenExpired(finalToken, 0)) {
    return finalToken;
  }

  return null;
};

const callRefreshEndpoint = async () => {
  const res = await axios.post(
    "http://localhost:8080/auth/refresh",
    {},
    {
      withCredentials: true,
      headers: getRefreshHeaders(),
    },
  );

  const newAccessToken = res.data.data.accessToken;
  localStorage.setItem("accessToken", newAccessToken);
  return newAccessToken;
};

const performRefresh = async () => {
  const tokenBefore = localStorage.getItem("accessToken");

  if (isRefreshLockHeld()) {
    const tokenFromOtherTab = await waitForCrossTabRefresh(tokenBefore);
    if (tokenFromOtherTab) {
      return tokenFromOtherTab;
    }
  }

  localStorage.setItem(REFRESH_LOCK_KEY, String(Date.now()));

  try {
    return await callRefreshEndpoint();
  } finally {
    localStorage.removeItem(REFRESH_LOCK_KEY);
  }
};

const refreshWithRetry = async () => {
  try {
    return await performRefresh();
  } catch (firstError) {
    // Another tab may have rotated the refresh token — wait and retry once
    await sleep(300);

    const existingToken = localStorage.getItem("accessToken");
    if (existingToken && !isAccessTokenExpired(existingToken, 0)) {
      return existingToken;
    }

    try {
      return await callRefreshEndpoint();
    } catch {
      clearSession();
      throw firstError;
    }
  }
};

export const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshWithRetry().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
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

    if (!original) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/logout") ||
      original.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
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
