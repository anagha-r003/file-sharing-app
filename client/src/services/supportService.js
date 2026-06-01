import api from "./api";

export const sendSupportMessage = async (supportData) => {
  try {
    const response = await api.post("/support", supportData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
