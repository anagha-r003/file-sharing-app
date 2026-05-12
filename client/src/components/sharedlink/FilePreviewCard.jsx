import { useState } from "react";
import FileActions from "./Fileactions";
import { FileIcon } from "lucide-react";
import { ClockIcon } from "lucide-react";
import { SearchIcon } from "lucide-react";
// ADD these instead
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
/**
 * FilePreviewCard
 * Props:
 *   fileName   {string}
 *   fileType   {string}  – e.g. "PDF"
 *   fileSize   {string}  – e.g. "2.4 MB"
 *   pageCount  {number}  – e.g. 14
 *   sharedDate {string}  – e.g. "Apr 28, 2026"
 *   expiryDate {string}  – e.g. "May 15, 2026"
 *   onDownload {function}
 *   onPreview  {function}
 *   onCopy     {function}
 */
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

  return (
    <div
      className="animate-fade-up-2 w-full rounded-2xl overflow-hidden"
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
        className="relative flex flex-col items-center justify-center cursor-pointer grid-bg overflow-hidden"
        style={{
          height: 300,
          background: "rgba(26,26,46,1)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onPreview}
      >
        {/* File-type badge */}
        <span
          className="absolute top-4 right-4 mono text-xs px-2 py-0.5 rounded z-10"
          style={{
            background: "rgba(248,65,65,0.12)",
            border: "1px solid rgba(248,65,65,0.28)",
            color: "#f87171",
            letterSpacing: "0.06em",
          }}
        >
          {fileType}
        </span>

        {/* PDF Preview */}
        {isPdf && (
          <div className="overflow-hidden">
            <Document file={previewUrl}>
              <Page
                pageNumber={1}
                width={420}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        )}

        {/* Image Preview */}
        {isImage && (
          <img
            src={previewUrl}
            alt={fileName}
            className="w-full h-full object-cover"
          />
        )}

        {/* Video Preview */}
        {isVideo && (
          <video
            src={previewUrl}
            className="w-full h-full object-cover"
            controls
          />
        )}

        {/* Fallback */}
        {!isPdf && !isImage && !isVideo && (
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <FileIcon size={72} />
            <p className="mono text-sm">Preview not available</p>
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: hovered ? "rgba(0,0,0,0.35)" : "transparent",
            transition: "0.25s",
          }}
        >
          {hovered && (
            <div className="flex items-center gap-2 mono text-xs text-white">
              <SearchIcon size={18} />
              Open full preview
            </div>
          )}
        </div>
      </div>

      {/* ── File metadata ── */}
      <div
        className="flex items-start justify-between gap-4 px-7 py-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex flex-col gap-2">
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ color: "#f0eeff", letterSpacing: "-0.02em" }}
          >
            {fileName}
          </h1>

          <div
            className="flex items-center gap-3 mono text-xs flex-wrap"
            style={{ color: "#7b7a99" }}
          >
            {/* Type badge */}
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded"
              style={{
                background: "rgba(248,65,65,0.1)",
                border: "1px solid rgba(248,65,65,0.2)",
                color: "#f87171",
                letterSpacing: "0.06em",
              }}
            >
              <FileIcon />
              {fileType}
            </span>

            <span>{fileSize}</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-40" />
            <span>{pageCount} pages</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-40" />
            <span>Shared {sharedDate}</span>
          </div>
        </div>

        {/* Expiry */}
        <div
          className="flex items-center gap-1.5 mono text-xs flex-shrink-0 pt-1"
          style={{ color: "#7b7a99" }}
        >
          <ClockIcon />
          {expiryDate}
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
