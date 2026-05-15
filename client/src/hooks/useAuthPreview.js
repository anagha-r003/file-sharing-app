import { useState, useEffect } from "react";
import api from "../services/api";

export function useAuthPreview(fileId, hasPreview) {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!hasPreview || !fileId) return;

    let objectUrl = null;

    const fetchPreview = async () => {
      try {
        const res = await api.get(`/files/preview/${fileId}`, {
          responseType: "blob", // ← tells axios to return raw binary
        });

        objectUrl = URL.createObjectURL(res.data);
        setBlobUrl(objectUrl);
      } catch {
        setBlobUrl(null);
      }
    };

    fetchPreview();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId, hasPreview]);

  return blobUrl;
}