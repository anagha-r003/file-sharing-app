import { useEffect, useState } from "react";
import FileTable from "../../components/myfiles/FileTable";
import { getFiles, downloadFiles, getFileStats } from "../../services/fileService";
import FileViewModal from "../../components/myfiles/FileViewModal";
import { usePageSettings } from "../../context/LayoutContext";

function MyFilesPage() {
  const [files, setFiles] = useState(null);
  const [fileStats, setFileStats] = useState(null);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(10);

  const [viewingFile, setViewingFile] = useState(null);

  usePageSettings({ title: "My Files" });

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
      f.id === updatedFile.id ? updatedFile : f
    ),
  }));
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
        />
      )}

      {viewingFile && (
        <FileViewModal
          file={viewingFile}
          onClose={() => setViewingFile(null)}
          onDownload={() => downloadFiles([viewingFile.id])}
        />
      )}
    </>
  );
}

export default MyFilesPage;
