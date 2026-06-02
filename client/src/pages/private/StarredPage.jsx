import { useEffect, useState } from "react";
import FileTable from "../../components/myfiles/FileTable"; // Reuse your existing table logic
import { getStarredFiles } from "../../services/fileService";
import { usePageSettings } from "../../context/LayoutContext";
import RenameModal from "../../common/ui/RenameModal";
import { renameFile } from "../../services/fileService";
import Toast from "../../components/sharedlink/Toast";

function StarredPage() {
  const [starredFiles, setStarredFiles] = useState(null);
  const [loading, setLoading] = useState(true);

  usePageSettings({
    title: "Starred",
    contentClassName: "none-scrollbar",
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [renamingFile, setRenamingFile] = useState(null);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const fetchStarredData = async () => {
    setLoading(true);
    try {
      const filesRes = await getStarredFiles(page, pageSize);

      setStarredFiles(filesRes);
    } catch (err) {
      console.error("Failed to fetch starred files:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpdate = (updatedFile) => {
    setStarredFiles((prev) => ({
      ...prev,

      content: updatedFile.starred
        ? prev.content.map((file) =>
            file.id === updatedFile.id ? updatedFile : file,
          )
        : prev.content.filter((file) => file.id !== updatedFile.id),
    }));
    showToast(`"${updatedFile.name}" unstarred successfully`, "success");
  };

  const showToast = (message, type = "success") => {
    setToast({
      visible: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((t) => ({
        ...t,
        visible: false,
      }));
    }, 3000);
  };

  const handleRename = async (file, newName) => {
    try {
      await renameFile(file.id, newName);

      const updatedFile = {
        ...file,
        name: newName,
      };

      handleFileUpdate(updatedFile);

      setRenamingFile(null);

      showToast(`"${newName}" renamed successfully`, "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Rename failed", "error");
    }
  };

  useEffect(() => {
    fetchStarredData();
  }, [page, pageSize]);

  return (
    <>
      <div className="max-w-[1400px] mx-auto">
        {/* Page Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
              <span className="material-symbols-outlined text-amber-400 text-2xl">
                workspace_premium
              </span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Important Assets
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                Your high-priority files and frequently accessed documents.
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="animate-pulse">Loading your favorites...</div>
          </div>
        ) : starredFiles?.content?.length > 0 ? (
          <FileTable
            files={starredFiles}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            onRefresh={() => fetchStarredData()}
            onFileUpdate={handleFileUpdate}
            onRename={setRenamingFile}
            showToast={showToast}
            showStats={false}
          />
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-500 text-3xl">
                star_outline
              </span>
            </div>
            <h3 className="text-white font-bold text-lg">
              No starred files yet
            </h3>
            <p className="text-slate-500 text-sm mt-1 text-center max-w-xs">
              Star important files to find them here instantly later.
            </p>
          </div>
        )}

        {renamingFile && (
          <RenameModal
            isOpen={!!renamingFile}
            currentName={renamingFile.name}
            type="file"
            onClose={() => setRenamingFile(null)}
            onSave={(newName) => handleRename(renamingFile, newName)}
          />
        )}

        <Toast
          message={toast.message}
          visible={toast.visible}
          type={toast.type}
        />
      </div>
    </>
  );
}

export default StarredPage;
