import api from "./api";

export const uploadFiles = async (files, onProgress) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post("/files/upload", formData, {
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

export const getFiles = async (page = 0, size = 10) => {
  const response = await api.get("/files", {
    params: {
      page,
      size,
    },
  });

  console.log(response.data.data);
  return response.data.data;
};

export const downloadFiles = async (fileIds) => {
  const response = await api.post("/files/download", fileIds, {
    responseType: "blob",
  });

  // Extract filename from backend header
  const disposition = response.headers["content-disposition"];

  let filename = "download";

  if (disposition && disposition.includes("filename=")) {
    filename = disposition.split("filename=")[1].replace(/"/g, "");
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));

  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

export const deleteFiles = async (fileIds) => {
  const response = await api.delete("/files", {
    data: fileIds,
  });

  return response.data;
};

export const deleteFile = async (fileIds) => {
  return deleteFiles(fileIds);
};

// export const uploadFile = async (file, onProgress) => {
//   return uploadFiles([file], onProgress);
// };

export const viewFile = async (fileId) => {
  const response = await api.get(`/files/${fileId}/view`);
  return response.data;
};

// export const downloadFile = async (fileId, fileName = "download") => {
//   const response = await api.get(`/files/${fileId}/download`, {
//     responseType: "blob",
//   });

//   const url = window.URL.createObjectURL(new Blob([response.data]));

//   const link = document.createElement("a");
//   link.href = url;
//   link.setAttribute("download", fileName);
//   document.body.appendChild(link);
//   link.click();
//   link.remove();
//   window.URL.revokeObjectURL(url);

//   return response.data;
// };

export const starFile = async (fileId) => {
  const response = await api.patch(`/files/star/${fileId}`);

  return response.data;
};

export const unstarFile = async (fileId) => {
  const response = await api.patch(`/files/unstar/${fileId}`);

  return response.data;
};
