import api from "./api";

// Create share links
export const generateShareLink = async (
  shareData
) => {
  const response = await api.post(
    "/share/generate",
    shareData
  );

  return response.data;
};

export const sendShareLink = async (
  shareData
) => {
  const response = await api.post(
    "/share/send",
    shareData
  );

  return response.data;
};


// Resolve share link
export const resolveShareLink = async (
  token
) => {
  const response = await api.get(
    `/share/${token}`
  );

  return response.data;
};

// Get my shared files
export const getMySharedFiles = async (
  page = 0,
  size = 10
) => {
  const response = await api.get(
    "/share/my-shares",
    {
      params: {
        page,
        size,
      },
    }
  );

  return response.data;
};

// Get files shared with me
export const getSharedWithMeFiles = async (
  page = 0,
  size = 10
) => {
  const response = await api.get(
    "/share/shared-with-me",
    {
      params: {
        page,
        size,
      },
    }
  );

  return response.data;
};

// Revoke share link
export const revokeShareLink = async (
  shareId
) => {
  const response = await api.put(
    `/share/revoke/${shareId}`
  );

  return response.data;
};

// View shared file
export const viewSharedFile = async (
  token
) => {
  const response = await api.get(
    `/share/view/${token}`,
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  );

  return url;
};

// Download shared file
export const downloadSharedFile = async (
  token,
  fileName = "download"
) => {
  const response = await api.get(
    `/share/download/${token}`,
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  );

  const link =
    document.createElement("a");

  link.href = url;

  link.setAttribute(
    "download",
    fileName
  );

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};