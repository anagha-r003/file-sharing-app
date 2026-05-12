import api from "./api";

export const getDeletedFiles = async (
  page = 0,
  size = 10
) => {
  const response = await api.get(
    "/files/recycle-bin",
    {
      params: {
        page,
        size,
      },
    }
  );

  return response.data;
};

export const restoreFiles = async (
  fileIds
) => {
  const response = await api.put(
    "/files/recycle-bin/restore",
    fileIds
  );

  return response.data;
};

export const permanentlyDeleteFiles =
  async (fileIds) => {
    const response = await api.delete(
      "/files/recycle-bin/permanent-delete",
      {
        data: fileIds,
      }
    );

    return response.data;
  };

export const restoreAllFiles =
  async () => {
    const response = await api.put(
      "/files/recycle-bin/restore-all"
    );

    return response.data;
  };

export const emptyRecycleBin =
  async () => {
    const response = await api.delete(
      "/files/recycle-bin/empty"
    );

    return response.data;
  };

export const getRecycleBinStats =
  async () => {
    const response = await api.get(
      "/files/recycle-bin/stats"
    );

    return response.data;
  };