import { useState } from "react";
import FileActions from "./FileActions";
import { FileIcon, ClockIcon, SearchIcon } from "lucide-react";

export default function FilePreviewCard({
  fileName = "",
  fileType = "",
  fileSize = "",
  pageCount = 0,
  sharedDate = "",
  expiryDate = "",
  previewUrl = "",
  onDownload,
  onPreview,
  onCopy,
}) {
  const [hovered, setHovered] = useState(false);
  const lowerType = fileType?.toLowerCase();
  const isPdf = lowerType === "pdf";
  const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(lowerType);
  const isVideo = ["mp4", "webm", "ogg"].includes(lowerType);

  // Format expiry date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return dateStr;
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        maxWidth: 680,
        background: "rgba(19,19,31,1)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.03), 0 24px 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* ── Preview thumbnail ── */}
      <div
        className="relative flex flex-col items-center justify-center cursor-pointer overflow-hidden"
        style={{
          height: "clamp(200px, 40vw, 300px)",
          background: "rgba(26,26,46,1)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onPreview}
      >
        {/* File-type badge */}
        <span
          className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded z-10 font-mono uppercase tracking-wider"
          style={{
            background: "rgba(248,65,65,0.12)",
            border: "1px solid rgba(248,65,65,0.28)",
            color: "#f87171",
          }}
        >
          {fileType}
        </span>

        {isPdf && (
          <iframe
            src={`${previewUrl}#toolbar=0`}
            title={fileName}
            className="w-full h-full"
            frameBorder="0"
          />
        )}
        {isImage && (
          <img
            src={previewUrl}
            alt={fileName}
            className="w-full h-full object-cover"
          />
        )}
        {isVideo && (
          <video
            src={previewUrl}
            className="w-full h-full object-cover"
            controls
          />
        )}
        {!isPdf && !isImage && !isVideo && (
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <FileIcon size={56} />
            <p className="font-mono text-sm">Preview not available</p>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: hovered ? "rgba(0,0,0,0.35)" : "transparent",
            transition: "0.25s",
          }}
        >
          {hovered && (
            <div className="flex items-center gap-2 font-mono text-xs text-white">
              <SearchIcon size={16} />
              Open full preview
            </div>
          )}
        </div>
      </div>

      {/* ── File metadata ── */}
      <div
        className="px-5 py-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex flex-col gap-2 min-w-0">
          {/* File name */}
          <h1
            className="text-base sm:text-lg font-bold leading-snug break-words"
            style={{ color: "#f0eeff", letterSpacing: "-0.02em" }}
          >
            {fileName}
          </h1>

          {/* Tags row */}
          <div
            className="flex flex-wrap items-center gap-2 font-mono text-xs"
            style={{ color: "#7b7a99" }}
          >
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded"
              style={{
                background: "rgba(248,65,65,0.1)",
                border: "1px solid rgba(248,65,65,0.2)",
                color: "#f87171",
              }}
            >
              <FileIcon size={11} />
              {fileType}
            </span>

            {fileSize && <span>{fileSize}</span>}

            {pageCount > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                <span>{pageCount} pages</span>
              </>
            )}

            {sharedDate && (
              <>
                <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                <span>Shared {sharedDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Expiry — moves below on mobile */}
        <div
          className="flex items-center gap-1.5 font-mono text-xs flex-shrink-0 sm:pt-1"
          style={{ color: "#7b7a99" }}
        >
          <ClockIcon size={13} />
          <span>{formatDate(expiryDate)}</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <FileActions
        onDownload={onDownload}
        onPreview={onPreview}
        onCopy={onCopy}
      />
    </div>
  );
}
