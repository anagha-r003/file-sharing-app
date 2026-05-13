import api from "./api";

export const getDashboardStats = async () => {
  const res = await api.get("/dashboard/stats");
  return res.data.data; 
};

export const getStorageStats = async () => {
  const res = await api.get("/dashboard/storage");
  return res.data.data;
};
