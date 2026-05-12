import { useState, useMemo } from "react";
import {
  deleteFile,
  downloadFile,
  viewFile,
  starFile,
  unstarFile,
} from "../../../services/fileService";
import ShareModal from "./ShareModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import FileTableStats from "./FileTableStats";
import FileTableToolbar from "./FileTableToolbar";
import FileTableListView from "./FileTableListView";
import FileTableGridView from "./FileTableGridView";
import Pagination from "../../common/ui/Pagination";
import { getFileStats } from "../../../common/utils/fileUtils";
import { PAGE_SIZE_OPTIONS } from "../../../common/constants/fileTypes";

function FileTable({ files, onRefresh }) {
  const [shareFile, setShareFile] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [view, setView] = useState("list");
  const [selectedIds, setSelectedIds] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Filtering
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name?.toLowerCase().includes(q));
  }, [files, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageIds = paginated.map((f) => f.id);

  // Selection state
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected = pageIds.some((id) => selectedIds.includes(id));

  // Statistics
  const stats = useMemo(() => getFileStats(files), [files]);

  // Handlers
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSearchClear = () => {
    setSearch("");
    setPage(1);
  };

  const handleView = async (file) => {
    try {
      const url = await viewFile(file.id);
      window.open(url, "_blank");
    } catch (err) {
      console.error("View failed", err);
    }
  };

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

  const handleToggleStar = async (file) => {
    try {
      if (file.isStarred) await unstarFile(file.id);
      else await starFile(file.id);
      onRefresh();
    } catch (err) {
      console.error("Star/unstar failed", err);
    }
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDownload = () => {
    selectedIds.forEach((id) => {
      const file = files.find((f) => f.id === id);
      if (file) downloadFile(file.id, file.name);
    });
  };

  const handleBulkShare = () => {
    const file = files.find((f) => f.id === selectedIds[0]);
    if (file) setShareFile(file);
  };

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

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  return (
    <>
      {/* Stats Cards */}
      <FileTableStats stats={stats} />

      {/* Main Table Container */}
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
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filtered.length}
          itemLabel="files"
          searchQuery={search}
          onPageChange={setPage}
        />
      </div>

      {/* Modals */}
      {deleteTarget && (
        <DeleteConfirmModal
          fileName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {shareFile && (
        <ShareModal file={shareFile} onClose={() => setShareFile(null)} />
      )}
    </>
  );
}

export default FileTable;
