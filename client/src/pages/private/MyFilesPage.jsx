import { useEffect, useState } from "react";
import FileTable from "../../components/myfiles/FileTable";
import { getFiles } from "../../services/fileService";
import { getFolders } from "../../services/folderService";
import { useLocation } from "react-router-dom";
import PageLayout from "../../layout/PageLayout";

function MyFilesPage() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  const fetchData = async () => {
    setLoading(true);

    try {
      const [filesRes, foldersRes] = await Promise.all([
        getFiles(),
        getFolders(),
      ]);

      console.log("Files response:", filesRes);
      console.log("Folders response:", foldersRes);

      setFiles(Array.isArray(filesRes) ? filesRes : filesRes.data || []);

      setFolders(
        Array.isArray(foldersRes) ? foldersRes : foldersRes.data || [],
      );
    } catch (err) {
      console.error("Failed to fetch data:", err);
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

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [location.pathname]);

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
        <FileTable files={files} folders={folders} onRefresh={fetchData} />
      )}
    </PageLayout>
  );
}

export default MyFilesPage;
