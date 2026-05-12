export const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
export const VIDEO_EXTS = new Set(["mp4", "mov", "avi", "mkv"]);
export const ARCHIVE_EXTS = new Set(["zip", "rar", "tar", "gz"]);
export const DOC_EXTS = new Set(["doc", "docx"]);
export const DOC_STAT_EXTS = new Set(["doc", "docx", "txt", "pdf"]);

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const FILE_TYPE_CONFIG = {
  image: {
    exts: IMAGE_EXTS,
    icon: "image",
    color: "text-green-400 bg-green-400/10",
    badge: "IMAGE",
    hasPreview: true,
  },
  video: {
    exts: VIDEO_EXTS,
    icon: "videocam",
    color: "text-yellow-400 bg-yellow-400/10",
    badge: "VIDEO",
    hasPreview: false,
  },
  archive: {
    exts: ARCHIVE_EXTS,
    icon: "folder_zip",
    color: "text-orange-400 bg-orange-400/10",
    badge: "ARCHIVE",
    hasPreview: false,
  },
  pdf: {
    exts: new Set(["pdf"]),
    icon: "picture_as_pdf",
    color: "text-red-400 bg-red-400/10",
    badge: "PDF DOCUMENT",
    hasPreview: true,
  },
  document: {
    exts: DOC_EXTS,
    icon: "description",
    color: "text-blue-400 bg-blue-400/10",
    badge: "DOCUMENT",
    hasPreview: false,
  },
};
