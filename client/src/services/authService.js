import api from "./api";
import axios from "axios";

export const registerUser = async (userData) => {
  const response = await axios.post(
    "http://localhost:8080/auth/register",
    userData
  );

  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await axios.post(
    "http://localhost:8080/auth/login",
    loginData,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const logoutUser = async () => {
  try {
    await api.post(
      "/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error(error);
  } finally {
    localStorage.removeItem("accessToken");
  }
};

export const getStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await api.get("/dashboard/activity");
  return response.data;
};