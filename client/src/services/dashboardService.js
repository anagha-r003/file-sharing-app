import api from "./api";

export const getStorageStats = async () => {
  const response = await api.get("/dashboard/storage");
  return response.data;
};
