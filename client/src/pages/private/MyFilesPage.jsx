import { useEffect, useState } from "react";
import FileTable from "../../components/myfiles/FileTable";
import { getFiles,downloadFiles } from "../../services/fileService";
import PageLayout from "../../layout/PageLayout";
import FileViewModal from "../../components/myfiles/FileViewModal";

function MyFilesPage() {
  const [files, setFiles] = useState(null);

  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(10);

  const [viewingFile, setViewingFile] = useState(null);

  const fetchData = async (currentPage = page, currentSize = pageSize) => {
    setLoading(true);

    try {
      const filesRes = await getFiles(currentPage, currentSize);

      setFiles(filesRes);
    } catch (err) {
      console.error(err);
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
  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data when page changes
  useEffect(() => {
    fetchData(page, pageSize);
  }, [page, pageSize]);

  return (
    <PageLayout
      title="My Files"
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onMenuClick={() => setSidebarOpen((prev) => !prev)}
    >
      {loading ? (
        <div className="p-16 text-center text-slate-500">Loading files...</div>
      ) : (
        <FileTable
          files={files}
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
    </PageLayout>
  );
}

export default MyFilesPage;
