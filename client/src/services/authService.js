import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post(
    "http://localhost:8080/auth/register",
    userData,
  );

  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await api.post(
    "http://localhost:8080/auth/login",
    loginData,
    {
      withCredentials: true,
    },
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
      },
    );
  } catch (error) {
    console.error(error);
  }
};

export const forgotPassword = async (emailData) => {
  const response = await api.post("/auth/forgot-password", emailData);
  return response.data;
}

export const resetPassword = async (resetData) => {
  const response = await api.post("/auth/reset-password", resetData);
  return response.data;
}