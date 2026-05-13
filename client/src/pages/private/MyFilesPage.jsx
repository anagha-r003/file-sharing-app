import { useEffect, useState } from "react";
import FileTable from "../../components/myfiles/FileTable";
import { getFiles } from "../../services/fileService";
import { useLocation } from "react-router-dom";
import PageLayout from "../../layout/PageLayout";

function MyFilesPage() {
  const [files, setFiles] = useState(null);

  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(10);

  const location = useLocation();

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
        />
      )}
    </PageLayout>
  );
}

export default MyFilesPage;
