import { useEffect, useMemo, useState } from "react";
import {
  RotateCcw,
  Trash2,
  AlertTriangle,
  Clock,
  HardDrive,
  Calendar,
} from "lucide-react";

import PageLayout from "../layouts/PageLayout";
import DaysBar from "../components/recyclebin/DaysBar";
import ConfirmModal from "../components/recyclebin/ConfirmModal";

import Pagination from "../common/components/ui/Pagination";
import SearchInput from "../common/components/ui/SearchInput";

import {
  getDeletedFiles,
  restoreFile,
  permanentlyDeleteFile,
  emptyRecycleBin,
  restoreAllFiles,
} from "../services/fileService";

function RecycleBin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [files, setFiles] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);

  const pageSize = 10;

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  // Filtered files
  const filtered = useMemo(() => {
    return files.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [files, search]);

  // Reset page on search
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const expiringSoon = files.filter(
    (f) => f.daysLeft <= 7
  ).length;

  const getFileEmoji = (type) => {
    const map = {
      PDF: "📄",
      IMAGE: "🖼️",
      VIDEO: "🎬",
      XLSX: "📊",
      ZIP: "🗜️",
      FIG: "📝",
    };

    return map[type?.toUpperCase()] || "📄";
  };

  const getFileColor = (type) => {
    const map = {
      PDF: "bg-red-500/10 text-red-400",
      IMAGE: "bg-green-500/10 text-green-400",
      VIDEO: "bg-orange-500/10 text-orange-400",
      XLSX: "bg-emerald-500/10 text-emerald-400",
      ZIP: "bg-violet-500/10 text-violet-400",
      FIG: "bg-blue-500/10 text-blue-400",
    };

    return (
      map[type?.toUpperCase()] ||
      "bg-slate-500/10 text-slate-400"
    );
  };

  const formatFiles = (data) => {
    return data.map((file) => {
      const deletedAt = new Date(file.deletedAt);

      const now = new Date();

      const daysSince = Math.floor(
        (now - deletedAt) / (1000 * 60 * 60 * 24)
      );

      const daysLeft = Math.max(0, 30 - daysSince);

      const fileType =
        file.type?.toUpperCase() || "FILE";

      return {
        id: file.id,
        name: file.name,

        size:
          file.size < 1024 * 1024
            ? (file.size / 1024).toFixed(1) + " KB"
            : (
                file.size /
                (1024 * 1024)
              ).toFixed(2) + " MB",

        type: fileType,

        deletedAgo:
          daysSince === 0
            ? "Today"
            : `${daysSince} day${
                daysSince > 1 ? "s" : ""
              } ago`,

        daysLeft,

        emoji: getFileEmoji(fileType),

        color: getFileColor(fileType),
      };
    });
  };

  const fetchDeletedFiles = async () => {
    setLoading(true);

    try {
      const res = await getDeletedFiles();

      setFiles(formatFiles(res.data));

    } catch (err) {
      console.error(
        "Error fetching deleted files:",
        err
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedFiles();
  }, []);

  const restore = async (id) => {
    try {
      await restoreFile(id);

      await fetchDeletedFiles();

    } catch (err) {
      console.error("Restore failed", err);
    }
  };

  const permDelete = async (id) => {
    try {
      await permanentlyDeleteFile(id);

      await fetchDeletedFiles();

    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleConfirm = async () => {
    if (!modal) return;

    try {
      if (modal.type === "delete") {
        await permDelete(modal.id);
      }

      if (modal.type === "emptyBin") {
        await emptyRecycleBin();
      }

      if (modal.type === "restoreAll") {
        await restoreAllFiles();
      }

      await fetchDeletedFiles();

    } catch (err) {
      console.error("Action failed", err);

    } finally {
      setModal(null);
    }
  };

  const stats = [
    {
      label: "Total Deleted",
      value: files.length,
      sub: "Files in bin",
      Icon: Trash2,
      ring: "bg-red-500/10",
      ic: "text-red-400",
    },

    {
      label: "Expiring Soon",
      value: expiringSoon,
      sub: "Within 7 days",
      Icon: Clock,
      ring: "bg-orange-500/10",
      ic: "text-orange-400",
    },

    {
      label: "Space Used",
      value: "342 MB",
      sub: "Recoverable space",
      Icon: HardDrive,
      ring: "bg-blue-500/10",
      ic: "text-blue-400",
    },

    {
      label: "Retention",
      value: "30 days",
      sub: "Auto-delete period",
      Icon: Calendar,
      ring: "bg-violet-500/10",
      ic: "text-violet-400",
    },
  ];

  return (
    <PageLayout
      title="Recycle Bin"
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onMenuClick={() =>
        setSidebarOpen((prev) => !prev)
      }
      contentClassName="space-y-4 md:space-y-5"
    >
      {/* Warning Banner */}
      <div className="flex items-start sm:items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
        <AlertTriangle
          size={16}
          className="text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0"
        />

        <p className="text-sm leading-relaxed">
          <span className="font-semibold text-amber-400">
            Files are auto-deleted after 30 days.
          </span>{" "}
          <span className="text-slate-400">
            Restore items before they expire.
          </span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(
          ({
            label,
            value,
            sub,
            Icon,
            ring,
            ic,
          }) => (
            <div
              key={label}
              className="bg-[#13151a] border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                  {label}
                </span>

                <div
                  className={`w-8 h-8 rounded-lg ${ring} flex items-center justify-center`}
                >
                  <Icon size={15} className={ic} />
                </div>
              </div>

              <div className="text-2xl md:text-3xl font-bold text-white">
                {value}
              </div>

              <div className="text-xs text-slate-600">
                {sub}
              </div>
            </div>
          )
        )}
      </div>

      {/* Search + Actions */}
      <div className="bg-[#13151a] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <SearchInput
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          onClear={() => setSearch("")}
          placeholder="Search deleted files..."
          className="flex-1"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setModal({ type: "restoreAll" })
            }
            disabled={files.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-sm font-medium transition disabled:opacity-40"
          >
            <RotateCcw size={13} />
            Restore All
          </button>

          <button
            onClick={() =>
              setModal({ type: "emptyBin" })
            }
            disabled={files.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition disabled:opacity-40"
          >
            <Trash2 size={13} />
            Empty Bin
          </button>
        </div>
      </div>

      {/* Files */}
      <div className="bg-[#13151a] border border-white/5 rounded-2xl overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-[2fr_0.7fr_0.7fr_0.8fr_1fr_96px] px-5 py-3 bg-[#0f1013] border-b border-white/5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
          <div>Name</div>
          <div>Size</div>
          <div>Type</div>
          <div>Deleted</div>
          <div>Days Left</div>
          <div className="text-right">
            Actions
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-16 text-center text-slate-500">
            Loading deleted files...
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
            <Trash2
              size={40}
              className="opacity-20"
            />

            <p className="text-sm">
              {search
                ? "No files match your search."
                : "Your recycle bin is empty."}
            </p>
          </div>
        )}

        {/* File Rows */}
        {!loading &&
          paginated.map((file, idx) => (
            <div
              key={file.id}
              className={`group hover:bg-white/[0.02] transition ${
                idx !== paginated.length - 1
                  ? "border-b border-white/[0.04]"
                  : ""
              }`}
            >
              {/* Desktop */}
              <div className="hidden md:grid grid-cols-[2fr_0.7fr_0.7fr_0.8fr_1fr_96px] items-center px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg ${file.color} flex items-center justify-center`}
                  >
                    {file.emoji}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {file.name}
                    </p>

                    <p className="text-xs text-slate-600 mt-0.5">
                      Deleted {file.deletedAgo}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-slate-500">
                  {file.size}
                </div>

                <div>
                  <span className="text-[10px] font-semibold tracking-wider text-slate-500 bg-white/5 border border-white/10 rounded-md px-2 py-1">
                    {file.type}
                  </span>
                </div>

                <div className="text-sm text-slate-500">
                  {file.deletedAgo}
                </div>

                <DaysBar
                  daysLeft={file.daysLeft}
                />

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() =>
                      restore(file.id)
                    }
                    className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 flex items-center justify-center transition"
                  >
                    <RotateCcw size={13} />
                  </button>

                  <button
                    onClick={() =>
                      setModal({
                        type: "delete",
                        id: file.id,
                      })
                    }
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex md:hidden items-center gap-3 px-4 py-3.5">
                <div
                  className={`w-10 h-10 rounded-xl ${file.color} flex items-center justify-center text-lg`}
                >
                  {file.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {file.name}
                  </p>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] font-semibold tracking-wider text-slate-500 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                      {file.type}
                    </span>

                    <span className="text-xs text-slate-600">
                      {file.size}
                    </span>

                    <DaysBar
                      daysLeft={file.daysLeft}
                    />
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5">
                    Deleted {file.deletedAgo}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() =>
                      restore(file.id)
                    }
                    className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 flex items-center justify-center transition"
                  >
                    <RotateCcw size={13} />
                  </button>

                  <button
                    onClick={() =>
                      setModal({
                        type: "delete",
                        id: file.id,
                      })
                    }
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filtered.length}
            itemLabel="files"
            searchQuery={search}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Confirm Modal */}
      {modal && (
        <ConfirmModal
          message={
            modal.type === "delete"
              ? "Permanently delete this file? This cannot be undone."
              : modal.type === "emptyBin"
              ? "Empty the entire Recycle Bin?"
              : "Restore all files back to your vault?"
          }
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </PageLayout>
  );
}
export default RecycleBin;