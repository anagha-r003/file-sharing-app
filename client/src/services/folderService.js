import api from "./api";

export const createFolder = async (folderData) => {
  const response = await api.post("/folders", folderData);

  return response.data;
};

export const getFolders = async (page = 0, size = 8) => {
  const response = await api.get("/folders", {
    params: {
      page,
      size,
    },
  });

  return response.data;
};

export const addFilesToFolder = async (folderId, fileIds) => {
  const response = await api.patch(
    `/folders/files?folderId=${folderId}`,
    fileIds,
  );

  return response.data;
};

export const deleteFolder = async (folderId) => {
  const response = await api.delete(`/folders/${folderId}`);

  return response.data;
};

export const removeFileFromFolder = async (folderId, fileId) => {
  const response = await api.delete(`/folders/${folderId}/files/${fileId}`);

  return response.data;
};

export const getFolderById = async (folderId) => {
  const response = await api.get(`/folders/${folderId}`);

  return response.data;
};
