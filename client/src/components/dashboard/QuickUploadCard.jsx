import { useRef, useState } from "react";
import Toast from "../sharedlink/Toast";
import { uploadFiles as uploadFilesApi } from "../../services/fileService";
import { ALLOWED_FILE_EXTS } from "../../common/constants/fileTypes";

function QuickUploadCard({ onUploadComplete }) {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });

    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 3000);
  };
  const fileInputRef = useRef();
  const dragCounter = useRef(0); // tracks drag depth to avoid flicker on child elements

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList);

    setUploading(true);
    setResults([]);
    setProgress(0);

    const validFiles = [];
    const newResults = [];

    // Frontend Validation
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase();

      // File type validation
      if (!ALLOWED_FILE_EXTS.has(extension)) {
        newResults.push({
          name: file.name,
          ok: false,
          message: "Unsupported file type",
        });
        continue;
      }

      // Empty file validation
      if (file.size === 0) {
        newResults.push({
          name: file.name,
          ok: false,
          message: "Empty file is not allowed",
        });
        continue;
      }

      // Invalid file name validation
      const invalidFileNameRegex = /[<>:"/\\|?*]/;
      const fileNameWithoutExtension =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

      if (
        !fileNameWithoutExtension.trim() ||
        invalidFileNameRegex.test(file.name) ||
        file.name.startsWith(".") ||
        file.name.length > 255
      ) {
        newResults.push({
          name: file.name,
          ok: false,
          message: "Invalid file name",
        });
        continue;
      }

      // File size validation
      if (file.size > 100 * 1024 * 1024) {
        newResults.push({
          name: file.name,
          ok: false,
          message: "File exceeds 100MB limit",
        });
        continue;
      }

      validFiles.push(file);
    }

    // Stop if all invalid
    if (validFiles.length === 0) {
      setResults(newResults);
      setUploading(false);
      showToast("No valid files to upload", "error");
      return;
    }

    try {
      // SINGLE API CALL
      await uploadFilesApi(validFiles, (pct) => {
        setProgress(pct);
      });

      // Success results
      validFiles.forEach((file) => {
        newResults.push({ name: file.name, ok: true });
      });
      showToast(
        `Uploaded ${validFiles.length} file${
          validFiles.length === 1 ? "" : "s"
        } successfully`,
        "success",
      );
    } catch (err) {
      const message = err.response?.data?.message || "Upload failed";
      validFiles.forEach((file) => {
        newResults.push({ name: file.name, ok: false, message });
      });
      showToast(message, "error");
    }

    setResults(newResults);
    setProgress(0);
    setUploading(false);
    onUploadComplete?.();
  };

  // Drag handlers — use dragCounter to avoid isDragActive flickering when
  // the cursor moves over child elements inside the drop zone.
  const handleDragEnter = (e) => {
    if (uploading) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragActive(true);
  };

  const handleDragOver = (e) => {
    if (uploading) return;
    e.preventDefault(); // required to allow dropping
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    if (uploading) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    if (uploading) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0; // reset for next drag session
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <section className="custom-card p-5 md:p-8 rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 md:mb-6">
        <span className="material-symbols-outlined text-violet-400">
          cloud_upload
        </span>
        <h3 className="text-base md:text-lg font-bold text-white font-['Space_Grotesk']">
          Quick Upload
        </h3>
      </div>

      {/*
        Drop zone wrapper — handles drag-and-drop as additional functionality.
        The original Upload Files button inside is completely unchanged.
        No overlay div — dragCounter ref handles child-element flicker instead.
      */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group border-2 border-dashed rounded-xl p-6 md:p-12 flex flex-col items-center justify-center transition-all ${
          uploading
            ? "border-violet-500/50 bg-white/[0.02] cursor-not-allowed"
            : isDragActive
              ? "border-violet-500 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.01]"
              : "border-white/10 bg-white/[0.02] hover:border-violet-500/50"
        }`}
      >
        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-slate-400 group-hover:text-violet-400">
            {uploading
              ? "hourglass_empty"
              : isDragActive
                ? "file_download"
                : "upload"}
          </span>
        </div>

        {uploading ? (
          <>
            <p className="text-slate-300 font-medium text-sm md:text-base">
              Uploading... {progress}%
            </p>
            <div className="w-full max-w-xs mt-3 bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-violet-500 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : isDragActive ? (
          /* Drag-active overlay hint — shown only while dragging */
          <p className="text-violet-300 font-medium text-sm md:text-base pointer-events-none">
            Drop files to upload
          </p>
        ) : (
          /* ── Original upload UI — unchanged ── */
          <>
            <p className="text-slate-400 text-sm mb-4 text-center">
              Drag & drop files, or choose below
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Original upload button — untouched */}
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">
                  upload_file
                </span>
                Upload Files
              </button>
            </div>

            <p className="text-slate-500 text-xs mt-4 uppercase tracking-widest text-center">
              Multiple files • max 100 MB each
            </p>
          </>
        )}

        {/* Hidden file input — original, untouched */}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={(e) =>
            e.target.files.length > 0 && uploadFiles(e.target.files)
          }
          className="hidden"
        />
      </div>

      {/* Results — original, untouched */}
      {results.length > 0 && (
        <div className="mt-4 space-y-1">
          {results.map((r, i) => (
            <div
              key={i}
              className={`text-xs flex items-center gap-2 ${
                r.ok ? "text-emerald-400" : "text-red-400"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {r.ok ? "check_circle" : "error"}
              </span>
              <span className="truncate">{r.name}</span>
              {!r.ok && (
                <span className="text-red-500 shrink-0">— {r.message}</span>
              )}
            </div>
          ))}
        </div>
      )}
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
      />
    </section>
  );
}

export default QuickUploadCard;
