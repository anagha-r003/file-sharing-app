import { useEffect, useState } from "react";
import FileTable from "../../components/myfiles/FileTable";
import {
  getFiles,
  downloadFiles,
  getFileStats,
  renameFile,
} from "../../services/fileService";
import FileViewModal from "../../components/myfiles/FileViewModal";
import { usePageSettings } from "../../context/LayoutContext";
import RenameModal from "../../common/ui/RenameModal";
import Toast from "../../components/sharedlink/Toast";
function MyFilesPage() {
  const [files, setFiles] = useState(null);
  const [fileStats, setFileStats] = useState(null);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(10);

  const [viewingFile, setViewingFile] = useState(null);

  const [renamingFile, setRenamingFile] = useState(null);

  const [view, setView] = useState("list");

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  usePageSettings({ title: "My Files" });

  function showToast(message, type = "success") {
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
  }

  const fetchData = async (currentPage = page, currentSize = pageSize) => {
    setLoading(true);

    try {
      const filesRes = await getFiles(currentPage, currentSize);
      setFiles(filesRes);

      try {
        const statsRes = await getFileStats();
        setFileStats(statsRes);
      } catch (statsErr) {
        console.error("Failed to fetch file stats:", statsErr);
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpdate = (updatedFile) => {
    setFiles((prev) => ({
      ...prev,
      content: prev.content.map((f) =>
        f.id === updatedFile.id ? updatedFile : f,
      ),
    }));
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
  // Fetch data when page changes
  useEffect(() => {
    fetchData(page, pageSize);
  }, [page, pageSize]);

  return (
    <>
      {loading ? (
        <div className="p-16 text-center text-slate-500">Loading files...</div>
      ) : (
        <FileTable
          files={files}
          stats={fileStats}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          onRefresh={() => fetchData(page, pageSize)}
          onFileClick={setViewingFile}
          onFileUpdate={handleFileUpdate}
          onRename={setRenamingFile}
          view={view}
          onViewChange={setView}
          showToast={showToast}
        />
      )}

      {viewingFile && (
        <FileViewModal
          file={viewingFile}
          onClose={() => setViewingFile(null)}
          onDownload={() => downloadFiles([viewingFile.id])}
        />
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
    </>
  );
}

export default MyFilesPage;
