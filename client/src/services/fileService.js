import api from "./api";

export const uploadFiles = async (files, onProgress) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post(
    "/files/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },

      onUploadProgress: (e) => {
        if (onProgress) {
          const percent = Math.round(
            (e.loaded * 100) / e.total
          );

          onProgress(percent);
        }
      },
    }
  );

  return response.data;
};

export const getFiles = async (
  page = 0,
  size = 10
) => {
  const response = await api.get("/files", {
    params: {
      page,
      size,
    },
  });

  return response.data;
};

export const downloadFiles = async (
  fileIds
) => {
  const response = await api.post(
    "/files/download",
    fileIds,
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  );

  const link = document.createElement("a");

  link.href = url;

  link.setAttribute(
    "download",
    "downloads.zip"
  );

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

export const deleteFiles = async (
  fileIds
) => {
  const response = await api.delete(
    "/files",
    {
      data: fileIds,
    }
  );

  return response.data;
};