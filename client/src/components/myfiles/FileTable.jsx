import { useState, useMemo } from "react";
import {
  deleteFile,
  downloadFiles,
  starFile,
  unstarFile,
} from "../../services/fileService";

import ShareModal from "./ShareModal/ShareModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import FileTableStats from "./FileTableStats";
import FileTableToolbar from "./FileTableToolbar";
import FileTableListView from "./FileTableListView";
import FileTableGridView from "./FileTableGridView";
import Pagination from "../../common/ui/Pagination";
import AddToFolderModal from "../myfolders/AddToFolderModal";

import { getFileStats } from "../../utils/fileUtils";

function FileTable({
  files,
  setPage,
  pageSize,
  setPageSize,
  onRefresh,
  onRename,
  onFileClick,
  onFileUpdate,
  showToast,
  showStats = true,
  stats,
  view = "list",
  onViewChange = () => {},
}) {
  const [shareFile, setShareFile] = useState(null);

  const [search, setSearch] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const [hoveredId, setHoveredId] = useState(null);

  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const [folderFiles, setFolderFiles] = useState([]);

  // Filtering
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const content = files?.content || [];

    if (!q) return content;

    return content.filter((f) => f.name?.toLowerCase().includes(q));
  }, [files, search]);

  // Backend pagination
  const paginated = filtered;

  const totalPages = files?.totalPages || 1;

  const totalItems = files?.totalElements || 0;

  const currentPage = (files?.pageable?.pageNumber ?? 0) + 1;

  const pageIds = paginated?.map((f) => f.id) || [];

  // Selection state
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  // Statistics
  const finalStats = useMemo(
    () => stats || getFileStats(files?.content || []),
    [stats, files],
  );

  // Search handlers
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchClear = () => {
    setSearch("");
  };

  // Page size handler
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));

    setPage(0);
  };

  // Delete confirm
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const fileName = deleteTarget.name;
    setDeleteTarget(null);

    try {
      await deleteFile([deleteTarget.id]);

      onRefresh();
      showToast?.(`"${fileName}" deleted`, "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast?.("Delete failed", "error");
    }
  };

  // Bulk delete confirm
  const confirmBulkDelete = async () => {
    setShowBulkDeleteModal(false);
    setBulkDeleting(true);

    try {
      await deleteFile(selectedIds);

      clearSelection();

      onRefresh();
      showToast?.(`${selectedIds.length} files deleted`, "success");
    } catch (err) {
      console.error("Bulk delete failed:", err);
      showToast?.("Bulk delete failed", "error");
    } finally {
      setBulkDeleting(false);
    }
  };

  // Star toggle
  const handleToggleStar = async (file) => {
    try {
      if (file.isStarred) await unstarFile(file.id);
      else await starFile(file.id);

      onFileUpdate?.({ ...file, isStarred: !file.isStarred });
    } catch (err) {
      console.error("Star/unstar failed", err);
    }
  };

  // Single selection
  const toggleSelect = (id, e) => {
    e.stopPropagation();

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Select all
  const toggleSelectAll = () => {
    const allSelected = pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const clearSelection = () => setSelectedIds([]);

  // Bulk download
  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) return;
    console.log("Initiating bulk download for file IDs:", selectedIds);

    try {
      await downloadFiles(selectedIds);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Bulk share
  const handleBulkShare = () => {
    const file = files?.content?.find((f) => f.id === selectedIds[0]);

    if (file) setShareFile(file);
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setShowBulkDeleteModal(true);
  };

  const handleBulkFolder = () => {
    if (selectedIds.length === 0) return;

    const selectedFiles = files?.content?.filter((file) =>
      selectedIds.includes(file.id),
    );

    setFolderFiles(selectedFiles || []);
  };

  return (
    <>
      {/* Stats */}
      {showStats && <FileTableStats stats={finalStats} />}

      {/* Main container */}
      <div className="custom-card rounded-2xl flex flex-col">
        {/* Toolbar */}
        <FileTableToolbar
          search={search}
          onSearchChange={handleSearch}
          onSearchClear={handleSearchClear}
          selectedCount={selectedIds.length}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          view={view}
          onViewChange={onViewChange}
          onBulkDownload={handleBulkDownload}
          onBulkShare={handleBulkShare}
          onBulkDelete={handleBulkDelete}
          onFolder={handleBulkFolder}
          onClearSelection={clearSelection}
          bulkDeleting={bulkDeleting}
        />

        {/* List View */}
        {view === "list" && (
          <FileTableListView
            paginated={paginated}
            search={search}
            files={files}
            selectedIds={selectedIds}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onFileClick={onFileClick}
            onCheckboxChange={toggleSelect}
            onToggleStar={handleToggleStar}
            allPageSelected={allPageSelected}
            toggleSelectAll={toggleSelectAll}
            onShare={(file) => setShareFile(file)}
            onDelete={(file) => setDeleteTarget(file)}
            onFolder={(file) => setFolderFiles([file])}
            onRename={onRename}
          />
        )}

        {/* Grid View */}
        {view === "grid" && (
          <FileTableGridView
            paginated={paginated}
            search={search}
            selectedIds={selectedIds}
            onFileClick={onFileClick}
            onCheckboxChange={toggleSelect}
            onToggleStar={handleToggleStar}
          />
        )}

        {/* Pagination */}
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          itemLabel="files"
          searchQuery={search}
          onPageChange={(newPage) => setPage(newPage - 1)}
        />
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          fileName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <DeleteConfirmModal
          fileName={`${selectedIds.length} selected files`}
          onConfirm={confirmBulkDelete}
          onCancel={() => setShowBulkDeleteModal(false)}
        />
      )}

      {/* Share Modal */}
      {shareFile && (
        <ShareModal file={shareFile} onClose={() => setShareFile(null)} />
      )}
      {folderFiles.length > 0 && (
        <AddToFolderModal
          files={folderFiles}
          onClose={() => {
            setFolderFiles([]);
            clearSelection();
          }}
        />
      )}
    </>
  );
}

export default FileTable;
