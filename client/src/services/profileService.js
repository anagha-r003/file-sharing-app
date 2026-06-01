import api from "./api";

export const getProfile = async () => {
  const response = await api.get("/profile");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put("/profile", data);

  return response.data;
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.put("/profile/change-password", passwordData);

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
