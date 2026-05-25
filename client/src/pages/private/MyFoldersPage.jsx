import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../layout/PageLayout";
import FolderToolbar from "../../components/myfolders/FolderToolbar";
import FolderGrid from "../../components/myfolders/FolderGrid";
import ConfirmModal from "../../components/recyclebin/ConfirmModal";
import CreateFolderModal from "../../components/myfolders/CreateFolderModal";
import Toast from "../../components/sharedlink/Toast";
import { getFolders, deleteFolder } from "../../services/folderService";

function MyFoldersPage() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [folders, setFolders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch folders
  useEffect(() => {
    fetchFolders();
  }, []);

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

  async function fetchFolders() {
    setLoading(true);

    try {
      const response = await getFolders();

      console.log("Fetched folders:", response);

      setFolders(response.data || []);
    } catch (err) {
      showToast("Failed to load folders", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(folder) {
    try {
      await deleteFolder(folder.id);

      setDeleteTarget(null);

      showToast(`"${folder.name}" deleted`);

      fetchFolders();
    } catch (err) {
      showToast("Failed to delete folder", "error");
    }
  }

  const filtered = folders.filter((folder) =>
    folder.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <PageLayout
      title="My Vaults"
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onMenuClick={() => setSidebarOpen((prev) => !prev)}
    >
      <div className="flex flex-col gap-4 md:gap-6">
        <FolderToolbar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          onSearchClear={() => setSearch("")}
          folderCount={folders.length}
          onCreate={() => setShowCreate(true)}
        />

        <FolderGrid
          folders={filtered}
          loading={loading}
          search={search}
          onClear={() => setSearch("")}
          onCreate={() => setShowCreate(true)}
          onOpen={(folder) => navigate(`/my-folders/${folder.id}`)}
          onDelete={setDeleteTarget}
        />
      </div>

      {showCreate && (
        <CreateFolderModal
          onClose={() => setShowCreate(false)}
          onBack={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);

            showToast("Folder created!");

            fetchFolders();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Delete "${deleteTarget.name}"? This vault will be permanently removed.`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
      />
    </PageLayout>
  );
}

export default MyFoldersPage;
