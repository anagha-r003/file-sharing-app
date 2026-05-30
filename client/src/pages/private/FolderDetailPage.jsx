import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import FolderDetailHeader from "../../components/myfolders/FolderDetailHeader";
import FolderFileList from "../../components/myfolders/FolderFileList";
import ConfirmModal from "../../components/recyclebin/ConfirmModal";
import Toast from "../../components/sharedlink/Toast";
import FileViewModal from "../../components/myfiles/FileViewModal";
import { downloadFiles } from "../../services/fileService";
import { usePageSettings } from "../../context/LayoutContext";

import {
  getFolderById,
  removeFileFromFolder,
} from "../../services/folderService";

function FolderDetailPage() {
  const { id } = useParams();

  const [folder, setFolder] = useState(null);

  const [files, setFiles] = useState([]);

  const [page, setPage] = useState(1);

  const [pageSize] = useState(5);

  const [totalItems, setTotalItems] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [removeTarget, setRemoveTarget] = useState(null);

  const [viewingFile, setViewingFile] = useState(null);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  usePageSettings({ title: folder?.name ?? "Folder" });

  // Fetch folder
  useEffect(() => {
    fetchFolder();
  }, [id,page]);

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

  async function fetchFolder() {
    setLoading(true);

    try {
      const response =
  await getFolderById(
    id,
    page - 1,
    pageSize,
  );

      // actual folder object
      const folderData =
  response.data;

setFolder(folderData);

setFiles(
  folderData.files || [],
);

setTotalItems(
  folderData.filesCount || 0,
);

setTotalPages(
  Math.ceil(
    folderData.filesCount /
      pageSize,
  ),
);
    } catch (err) {
      showToast("Failed to load folder", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(file) {
    try {
      await removeFileFromFolder(folder.id, file.id);

      setRemoveTarget(null);

      showToast(`"${file.name}" removed from folder`);

      if (
  files.length === 1 &&
  page > 1
) {
  setPage(
    (prev) => prev - 1,
  );
} else {
  fetchFolder();
}
    } catch (err) {
      showToast("Failed to remove file", "error");
    }
  }

  const filtered = files.filter((file) =>
    file.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <>
      <div className="flex flex-col gap-4 md:gap-5 max-w-4xl">
        <FolderDetailHeader folder={folder} fileCount={files.length} />

       <FolderFileList
  files={filtered}
  loading={loading}
  search={search}
  onSearchChange={(e) =>
    setSearch(e.target.value)
  }
  onSearchClear={() =>
    setSearch("")
  }
  onRemove={setRemoveTarget}
  onView={setViewingFile}
  page={page}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={setPage}
/>
      </div>

      {removeTarget && (
        <ConfirmModal
          message={`Remove "${removeTarget.name}" from this folder?`}
          onConfirm={() => handleRemove(removeTarget)}
          onCancel={() => setRemoveTarget(null)}
        />
      )}

      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
      />

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

export default FolderDetailPage;
