import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FolderToolbar from "../../components/myfolders/FolderToolbar";
import FolderGrid from "../../components/myfolders/FolderGrid";
import ConfirmModal from "../../components/recyclebin/ConfirmModal";
import CreateFolderModal from "../../components/myfolders/CreateFolderModal";
import Toast from "../../components/sharedlink/Toast";
import { getFolders, deleteFolder } from "../../services/folderService";
import Pagination from "../../common/ui/Pagination";
import { usePageSettings } from "../../context/LayoutContext";

function MyFoldersPage() {
  const navigate = useNavigate();

  const [folders, setFolders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(0);

  const [totalItems, setTotalItems] = useState(0);

  const pageSize = 8;

  const [showCreate, setShowCreate] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  usePageSettings({ title: "My Vaults" });

  // Fetch folders
  useEffect(() => {
    fetchFolders();
  }, [page]);

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
      const response = await getFolders(page - 1, pageSize);

      console.log("Fetched folders:", response);

      const pageData = response.data;

      setFolders(pageData.content || []);

      setTotalPages(pageData.totalPages);

      setTotalItems(pageData.totalElements);
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
    <>
      <div className="flex flex-col gap-4 md:gap-6">
        <FolderToolbar
          search={search}
          onSearchChange={(e) => {
            setSearch(e.target.value);

            setPage(1);
          }}
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

        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          itemLabel="vaults"
          searchQuery={search}
          onPageChange={setPage}
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
    </>
  );
}

export default MyFoldersPage;
