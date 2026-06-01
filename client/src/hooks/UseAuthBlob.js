import { useEffect, useState } from "react";
import api from "../services/api";

/**
 * Fetches a file from an authenticated endpoint and returns a blob URL.
 * Automatically revokes the blob URL on unmount to avoid memory leaks.
 *
 * @param {string|null} url     - API path to fetch (e.g. "/files/view/1")
 * @param {boolean}     enabled - Set false to skip fetching
 */
export function useAuthBlob(url, enabled) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled || !url) return;

    let objectUrl = null;
    setLoading(true);
    setError(false);
    setBlobUrl(null);

    api
      .get(url, { responseType: "blob" })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setBlobUrl(objectUrl);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, enabled]);

  return { blobUrl, loading, error };
}