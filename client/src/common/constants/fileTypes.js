export const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);

export const VIDEO_EXTS = new Set(["mp4", "webm", "mkv"]);

export const AUDIO_EXTS = new Set(["mp3", "wav"]);

export const ARCHIVE_EXTS = new Set(["zip"]);

export const DOCUMENT_EXTS = new Set(["doc", "docx", "txt", "csv"]);

export const SPREADSHEET_EXTS = new Set(["xls", "xlsx"]);

export const PDF_EXTS = new Set(["pdf"]);

export const PRESENTATION_EXTS = new Set(["ppt", "pptx"]);

// Used for statistics/dashboard
export const DOC_STAT_EXTS = new Set([
  "doc",
  "docx",
  "txt",
  "pdf",
  "csv",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
]);

// One combined set for upload validation
export const ALLOWED_FILE_EXTS = new Set([
  ...IMAGE_EXTS,
  ...VIDEO_EXTS,
  ...AUDIO_EXTS,
  ...ARCHIVE_EXTS,
  ...DOCUMENT_EXTS,
  ...SPREADSHEET_EXTS,
  ...PRESENTATION_EXTS,
  ...PDF_EXTS,
]);

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

  audio: {
    exts: AUDIO_EXTS,
    icon: "music_note",
    color: "text-pink-400 bg-pink-400/10",
    badge: "AUDIO",
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
    exts: PDF_EXTS,
    icon: "picture_as_pdf",
    color: "text-red-400 bg-red-400/10",
    badge: "PDF DOCUMENT",
    hasPreview: true,
  },

  document: {
    exts: DOCUMENT_EXTS,
    icon: "description",
    color: "text-blue-400 bg-blue-400/10",
    badge: "DOCUMENT",
    hasPreview: false,
  },

  spreadsheet: {
    exts: SPREADSHEET_EXTS,
    icon: "table_chart",
    color: "text-emerald-400 bg-emerald-400/10",
    badge: "SPREADSHEET",
    hasPreview: false,
  },

  presentation: {
    exts: PRESENTATION_EXTS,
    icon: "slideshow",
    color: "text-orange-400 bg-orange-400/10",
    badge: "PRESENTATION",
    hasPreview: false,
  },
};
