import { useEffect, useMemo, useState } from "react";
import { HardDrive, Trash2, X } from "lucide-react";
import Modal from "../../common/ui/Modal";
import Toast from "../sharedlink/Toast";
import DeleteConfirmModal from "../myfiles/DeleteConfirmModal";
import CleanupFileList from "./CleanupFileList";
import { getCleanupData } from "../../services/dashboardService";
import { deleteFiles } from "../../services/fileService";
import { formatSize } from "../../utils/fileUtils";

export default function CleanupSpaceModal({ isOpen, onClose, onDeleteComplete }) {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [largestFiles, setLargestFiles] = useState([]);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const allFiles = useMemo(() => {
    const fromLargest = largestFiles;
    const fromDuplicates = duplicateGroups.flatMap((g) => g.files);
    const map = new Map();
    [...fromLargest, ...fromDuplicates].forEach((f) => map.set(f.id, f));
    return map;
  }, [largestFiles, duplicateGroups]);

  const selectedSize = useMemo(() => {
    return selectedIds.reduce((sum, id) => {
      const file = allFiles.get(id);
      return sum + (file?.size || 0);
    }, 0);
  }, [selectedIds, allFiles]);

  const fetchCleanupData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getCleanupData();
      setLargestFiles(data?.largestFiles || []);
      setDuplicateGroups(data?.duplicateGroups || []);
    } catch (err) {
      console.error("Failed to fetch cleanup data:", err);
      setLargestFiles([]);
      setDuplicateGroups([]);
      const status = err.response?.status;
      const message =
        status === 404
          ? "Cleanup API not found. Restart the backend server and try again."
          : "Failed to load cleanup data. Please try again.";
      setLoadError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setDeleteTarget(null);
      fetchCleanupData();
    }
  }, [isOpen]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDeleteConfirm = async () => {
    const idsToDelete = deleteTarget?.bulk
      ? selectedIds
      : deleteTarget
        ? [deleteTarget.id]
        : [];

    if (idsToDelete.length === 0) return;

    setDeleting(true);
    try {
      await deleteFiles(idsToDelete);
      setSelectedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
      setDeleteTarget(null);
      showToast(
        idsToDelete.length === 1
          ? "File moved to recycle bin"
          : `${idsToDelete.length} files moved to recycle bin`,
        "success",
      );
      await fetchCleanupData();
      onDeleteComplete?.();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  const deleteLabel = deleteTarget?.bulk
    ? `${selectedIds.length} files`
    : deleteTarget?.name || "";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Clean Up Space"
        subtitle="Remove large or duplicate files to optimize your vault storage."
        maxWidth="max-w-4xl"
      >
        <div className="relative flex flex-col max-h-[min(75vh,720px)]">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-5">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6366f115] border border-[#6366f122] flex items-center justify-center">
                  <HardDrive size={18} className="text-[#6366f1] animate-pulse" />
                </div>
                <span className="text-[#44446a] text-sm animate-pulse">
                  Loading cleanup suggestions...
                </span>
              </div>
            ) : loadError ? (
              <div className="py-14 px-4 text-center bg-[#0f0f17] border border-[#1a1a28] rounded-[14px]">
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-red-400 text-xl">
                    error
                  </span>
                </div>
                <p className="text-sm text-red-400 mb-5 max-w-sm mx-auto leading-relaxed">
                  {loadError}
                </p>
                <button
                  onClick={fetchCleanupData}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <CleanupFileList
                largestFiles={largestFiles}
                duplicateGroups={duplicateGroups}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onDeleteFile={(file) => setDeleteTarget(file)}
              />
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="sticky bottom-0 left-0 right-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-[#0f0f17] border-t border-[#1a1a28] shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {selectedIds.length}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white truncate">
                    {formatSize(selectedSize)} selected
                  </p>
                  <p className="text-[11px] text-[#44446a]">
                    {selectedIds.length} file{selectedIds.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setDeleteTarget({ bulk: true })}
                  disabled={deleting}
                  className="flex items-center gap-2 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-xl text-xs sm:text-sm font-semibold transition disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="w-9 h-9 rounded-xl bg-[#1a1a28] hover:bg-[#252538] text-[#44446a] hover:text-white flex items-center justify-center transition border border-[#1a1a28]"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {deleteTarget && (
        <DeleteConfirmModal
          fileName={deleteLabel}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
      />
    </>
  );
}
