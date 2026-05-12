import api from "./api";

export const uploadFolder = async (files, onProgress) => {
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post("/folders/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (e) => {
      if (onProgress) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    },
  });

  return response.data;
};

export const getFolders = async () => {
  const response = await api.get("/folders");
  return response.data;
};
