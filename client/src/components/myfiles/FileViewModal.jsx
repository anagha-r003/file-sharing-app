import { useEffect, useCallback } from "react";
import api from "../../services/api";
import { getFileMeta, formatSize } from "../../utils/fileUtils";
import { useAuthBlob } from "../../hooks/UseAuthBlob";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const VIDEO_EXTS = new Set(["mp4", "mov", "avi", "mkv"]);

// Opens the actual file in a new browser tab using an authenticated fetch
async function openInNewTab(fileId) {
  const res = await api.get(`/files/view/${fileId}`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export default function FileViewModal({ file, onClose, onDownload }) {
  const { ext, icon, color, hasPreview } = getFileMeta(file?.name);

  const isImage = IMAGE_EXTS.has(ext);
  const isPdf = ext === "pdf";
  const isVideo = VIDEO_EXTS.has(ext);
  const canPreview = hasPreview || isVideo;

  const { blobUrl, loading, error } = useAuthBlob(
    canPreview ? `/files/view/${file?.id}` : null,
    canPreview,
  );

  // Close on Escape
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!file) return null;

  // ── Preview renderer ──
  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
          <svg
            className="animate-spin w-8 h-8 text-violet-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <span className="text-sm">Loading preview…</span>
        </div>
      );
    }

    if (!canPreview || error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-600">
            visibility_off
          </span>
          <div>
            <p className="text-sm font-medium text-slate-300 mb-1">
              Preview not available
            </p>
            <p className="text-xs text-slate-500">
              .{ext} files cannot be previewed in the browser
            </p>
          </div>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition"
            style={{
              background: "rgba(124,92,252,0.25)",
              border: "1px solid rgba(124,92,252,0.5)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              download
            </span>
            Download to view
          </button>
        </div>
      );
    }

    // Shared click handler — opens file in new tab
    const handlePreviewClick = async (e) => {
      if (e.target.closest("video")) return;
      e.stopPropagation();
      try {
        await openInNewTab(file.id);
      } catch {
        /* silently fail */
      }
    };

    // Hint badge shown over all previews
    const hintBadge = (
      <div
        className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 pointer-events-none select-none"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
          open_in_new
        </span>
        Click to open in new tab
      </div>
    );

    if (isImage && blobUrl) {
      return (
        <div
          className="relative w-full h-full cursor-pointer"
          onClick={handlePreviewClick}
        >
          <div className="flex items-center justify-center w-full h-full p-6 overflow-auto">
            <img
              src={blobUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{ pointerEvents: "none" }}
            />
          </div>
          {hintBadge}
        </div>
      );
    }

    if (isPdf && blobUrl) {
      return (
        <div
          className="relative w-full h-full cursor-pointer"
          onClick={handlePreviewClick}
        >
          <iframe
            src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full"
            title={file.name}
            style={{ pointerEvents: "scroll" }}
          />
          {hintBadge}
        </div>
      );
    }

    if (isVideo && blobUrl) {
      return (
        <div
          className="relative w-full h-full cursor-pointer"
          onClick={handlePreviewClick}
          style={{ background: "#000" }}
        >
          <div className="flex items-center justify-center w-full h-full">
            <video
              src={blobUrl}
              controls
              className="max-w-full max-h-full rounded-lg"
              style={{ maxHeight: "70vh" }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {hintBadge}
        </div>
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "#13131f",
          border: "1px solid rgba(255,255,255,0.08)",
          width: "85vw",
          height: "82vh",
          maxWidth: "1200px",
          maxHeight: "850px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-1.5 rounded-lg ${color}`}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                {icon}
              </span>
            </div>
            <div className="min-w-0">
              <p
                className="text-white text-sm font-medium truncate"
                title={file.name}
              >
                {file.name}
              </p>
              <p className="text-slate-500 text-xs">
                {ext.toUpperCase()}&nbsp;·&nbsp;{formatSize(file.size)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button
              onClick={() => openInNewTab(file.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 15 }}
              >
                open_in_new
              </span>
              Open
            </button>

            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition"
              style={{
                background: "rgba(124,92,252,0.2)",
                border: "1px solid rgba(124,92,252,0.4)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(124,92,252,0.35)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(124,92,252,0.2)")
              }
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 15 }}
              >
                download
              </span>
              Download
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Close (Esc)"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                close
              </span>
            </button>
          </div>
        </div>

        {/* ── Preview area ── */}
        <div
          className="flex-1 overflow-hidden"
          style={{ minHeight: 0, height: "75vh" }}
        >
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}
