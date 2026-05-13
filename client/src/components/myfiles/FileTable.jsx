import { useState, useMemo } from "react";
import {
  deleteFile,
  downloadFile,
  viewFile,
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

import { getFileStats } from "../../utils/fileUtils";

function FileTable({ files, page, setPage, pageSize, setPageSize, onRefresh }) {
  const [shareFile, setShareFile] = useState(null);

  const [search, setSearch] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [view, setView] = useState("list");

  const [selectedIds, setSelectedIds] = useState([]);

  const [hoveredId, setHoveredId] = useState(null);

  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  const somePageSelected = pageIds.some((id) => selectedIds.includes(id));

  // Statistics
  const stats = useMemo(() => getFileStats(files?.content || []), [files]);

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

  // File view
  const handleView = async (file) => {
    try {
      const url = await viewFile(file.id);

      window.open(url, "_blank");
    } catch (err) {
      console.error("View failed", err);
    }
  };

  // Delete confirm
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleteTarget(null);

    try {
      await deleteFile([deleteTarget.id]);

      onRefresh();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Star toggle
  const handleToggleStar = async (file) => {
    try {
      if (file.isStarred) await unstarFile(file.id);
      else await starFile(file.id);

      onRefresh();
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
  const handleBulkDownload = () => {
    selectedIds.forEach((id) => {
      const file = files?.content?.find((f) => f.id === id);

      if (file) downloadFile(file.id, file.name);
    });
  };

  // Bulk share
  const handleBulkShare = () => {
    const file = files?.content?.find((f) => f.id === selectedIds[0]);

    if (file) setShareFile(file);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    setBulkDeleting(true);

    try {
      await deleteFile(selectedIds);

      clearSelection();

      onRefresh();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <>
      {/* Stats */}
      <FileTableStats stats={stats} />

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
          onViewChange={setView}
          onBulkDownload={handleBulkDownload}
          onBulkShare={handleBulkShare}
          onBulkDelete={handleBulkDelete}
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
            onFileClick={handleView}
            onCheckboxChange={toggleSelect}
            onToggleStar={handleToggleStar}
            allPageSelected={allPageSelected}
            toggleSelectAll={toggleSelectAll}
            onShare={(file) => setShareFile(file)}
            onDelete={(file) => setDeleteTarget(file)}
          />
        )}

        {/* Grid View */}
        {view === "grid" && (
          <FileTableGridView
            paginated={paginated}
            search={search}
            selectedIds={selectedIds}
            onFileClick={handleView}
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

      {/* Share Modal */}
      {shareFile && (
        <ShareModal file={shareFile} onClose={() => setShareFile(null)} />
      )}
    </>
  );
}

export default FileTable;