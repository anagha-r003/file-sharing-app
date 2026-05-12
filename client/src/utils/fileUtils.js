import {
  FILE_TYPE_CONFIG,
  DOC_STAT_EXTS,
  IMAGE_EXTS,
  VIDEO_EXTS,
} from "../common/constants/fileTypes";

export const getFileExt = (name) =>
  name?.split(".").pop()?.toLowerCase().trim() || "";

export const getFileMeta = (name) => {
  const ext = getFileExt(name);

  if (FILE_TYPE_CONFIG.image.exts.has(ext)) {
    return { ext, ...FILE_TYPE_CONFIG.image };
  }
  if (FILE_TYPE_CONFIG.video.exts.has(ext)) {
    return { ext, ...FILE_TYPE_CONFIG.video };
  }
  if (FILE_TYPE_CONFIG.archive.exts.has(ext)) {
    return { ext, ...FILE_TYPE_CONFIG.archive };
  }
  if (FILE_TYPE_CONFIG.pdf.exts.has(ext)) {
    return { ext, ...FILE_TYPE_CONFIG.pdf };
  }
  if (FILE_TYPE_CONFIG.document.exts.has(ext)) {
    return { ext, ...FILE_TYPE_CONFIG.document };
  }

  return {
    ext,
    icon: "description",
    color: "text-blue-400 bg-blue-400/10",
    badge: ext ? ext.toUpperCase() : "FILE",
    hasPreview: false,
  };
};

export const formatSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getFileStats = (files) => {
  const stats = { documents: 0, images: 0, videos: 0, others: 0 };
  for (const f of files) {
    const ext = getFileMeta(f.name).ext;
    if (DOC_STAT_EXTS.has(ext)) stats.documents += 1;
    else if (IMAGE_EXTS.has(ext)) stats.images += 1;
    else if (VIDEO_EXTS.has(ext)) stats.videos += 1;
    else stats.others += 1;
  }
  return stats;
};
