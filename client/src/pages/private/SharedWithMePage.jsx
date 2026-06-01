import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/recyclebin/ConfirmModal";
import { usePageSettings } from "../../context/LayoutContext";
import {
  getSharedWithMeFiles,
  dismissSharedWithMeFile,
} from "../../services/shareService";
import Toast from "../../components/sharedlink/Toast";
import Pagination from "../../common/ui/Pagination";

function SharedWithMePage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  usePageSettings({ title: "Shared with Me" });
  const [searchQuery, setSearchQuery] = useState("");
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  // Reset to first page on search
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Fetch paginated files on page changes
  useEffect(() => {
    fetchSharedFiles(page);
  }, [page]);

  const fetchSharedFiles = async (currentPage = page) => {
    try {
      setLoading(true);
      const response = await getSharedWithMeFiles(currentPage - 1, pageSize);
      const pageData = response.data;
      const items = pageData.content ?? [];
      setFiles(items);
      setTotalPages(pageData.totalPages ?? 0);
      setTotalItems(pageData.totalElements ?? 0);
    } catch (error) {
      console.error("Failed to fetch shared files", error);
      showToast("Failed to fetch shared files", "error");
    } finally {
      setLoading(false);
    }
  };

  const getSharePreviewRoute = (file) => {
    if (file.token) {
      return `/public/share/${file.token}`;
    }
    if (file.shareToken) {
      return `/public/share/${file.shareToken}`;
    }
    if (file.shareUrl) {
      try {
        const parsedUrl = new URL(file.shareUrl);
        const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment) {
          return `/public/share/${lastSegment}`;
        }
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const handlePreview = (file) => {
    const previewRoute = getSharePreviewRoute(file);
    if (previewRoute) {
      navigate(previewRoute);
    } else if (file.shareUrl) {
      window.open(file.shareUrl, "_blank");
    } else {
      showToast("Preview not available.", "error");
    }
  };

  const handleRemove = async (file) => {
    try {
      setRemovingId(file.id);
      await dismissSharedWithMeFile(file.id);
      showToast(`"${file.fileName}" removed from your list`);
      // Refresh current page
      fetchSharedFiles(page);
    } catch (error) {
      console.error("Failed to remove shared file", error);
      showToast("Failed to remove shared file", "error");
    } finally {
      setRemovingId(null);
      setRemoveTarget(null);
    }
  };

  const getShareTypeLabel = (shareType) => {
    if (shareType === "PUBLIC") return "Public";
    if (shareType === "RESTRICTED") return "Restricted";
    return "Unknown";
  };

  const filteredFiles = files.filter((f) => {
    const query = searchQuery.toLowerCase();
    return (
      f.fileName.toLowerCase().includes(query) ||
      f.sharedByName.toLowerCase().includes(query) ||
      f.sharedByEmail.toLowerCase().includes(query) ||
      getShareTypeLabel(f.shareType).toLowerCase().includes(query)
    );
  });

  const getFormatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Returns initials from a name string
  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Cycles through a small set of avatar color pairs based on name
  const getAvatarColors = (name = "") => {
    const palettes = [
      { bg: "bg-violet-500/15", text: "text-violet-400" },
      { bg: "bg-emerald-500/15", text: "text-emerald-400" },
      { bg: "bg-sky-500/15", text: "text-sky-400" },
      { bg: "bg-rose-500/15", text: "text-rose-400" },
      { bg: "bg-amber-500/15", text: "text-amber-400" },
    ];
    const idx = name.charCodeAt(0) % palettes.length;
    return palettes[idx];
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="material-symbols-outlined text-sm">
              check_circle
            </span>
            Active
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="material-symbols-outlined text-sm">schedule</span>
            Expired
          </span>
        );
      case "REVOKED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="material-symbols-outlined text-sm">block</span>
            Revoked
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col gap-5 px-1">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-bold tracking-tight text-white leading-snug">
              Files Shared Directly with You
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              View files shared to your account, including public and restricted
              links.
            </p>
          </div>

          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search shared files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#13131a] border border-white/5 rounded-xl text-slate-200 text-sm pl-10 pr-4 py-3 outline-none focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/20 placeholder:text-slate-600 transition"
            />
          </div>
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="animate-pulse font-medium text-slate-400">
              Loading files shared with you...
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-white/5 bg-[#111115]/50">
            <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">
              folder_shared
            </span>
            <h3 className="text-lg font-bold text-slate-400">
              No shared files found
            </h3>
            
          </div>
        ) : (
          <>
            {/*Tablet + Desktop — single responsive table */}
            <div className="hidden md:block w-full lg:max-w-[1100px] lg:mx-auto rounded-2xl border border-white/5 bg-[#111115] overflow-hidden">
              <table
                className="w-full text-left border-collapse"
                style={{ tableLayout: "fixed" }}
              >
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    {/* File col */}
                    <th className="px-3 md:px-4 py-3 md:py-3.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500 w-[38%] lg:w-[31%]">
                      File
                    </th>
                    {/* Shared by */}
                    <th className="px-3 md:px-4 py-3 md:py-3.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500 w-[25%] lg:w-[23%]">
                      Shared by
                    </th>
                    {/* Access */}
                    <th className="px-3 md:px-4 py-3 md:py-3.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500 w-[17%] lg:w-[15%]">
                      Access
                    </th>
                    {/* Status */}
                    <th className="px-3 md:px-4 py-3 md:py-3.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500 w-[17%] lg:w-[15%]">
                      Status
                    </th>
                    {/* Actions */}
                    <th className="px-3 md:px-4 py-3 md:py-3.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500 text-right w-[10%] lg:w-[10%]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFiles.map((file, idx) => {
                    const avatarColors = getAvatarColors(file.sharedByName);
                    return (
                      <tr
                        key={file.id}
                        className={`group transition-colors hover:bg-white/[0.025] ${
                          idx !== filteredFiles.length - 1
                            ? "border-b border-white/[0.04]"
                            : ""
                        }`}
                      >
                        {/* ── File name + expiry ── */}
                        <td className="px-3 md:px-4 py-3 md:py-3.5">
                          <div className="flex items-center gap-2 md:gap-2.5">
                            {/* icon: smaller on tablet */}
                            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                              <span
                                className="material-symbols-outlined text-violet-400"
                                style={{ fontSize: "14px" }}
                              >
                                description
                              </span>
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs lg:text-sm font-medium text-slate-100 group-hover:text-violet-300 transition-colors truncate leading-snug">
                                {file.fileName}
                              </p>
                              <p className="text-[10px] lg:text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
                                Expires&nbsp;{getFormatDate(file.expiresAt)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ── Shared by ──  */}
                        <td className="px-3 md:px-4 py-3 md:py-3.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] lg:text-[10px] font-semibold ${avatarColors.bg} ${avatarColors.text}`}
                            >
                              {getInitials(file.sharedByName)}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs lg:text-sm font-medium text-slate-200 truncate leading-snug">
                                {file.sharedByName}
                              </p>
                              {/* email hidden on tablet, shown on desktop */}
                              <p className="hidden lg:block text-[11px] text-slate-500 mt-0.5 truncate">
                                {file.sharedByEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ── Access badge ── */}
                        <td className="px-3 md:px-4 py-3 md:py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap ${
                              file.shareType === "PUBLIC"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                            }`}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "11px" }}
                            >
                              {file.shareType === "PUBLIC" ? "public" : "lock"}
                            </span>
                            {getShareTypeLabel(file.shareType)}
                          </span>
                        </td>

                        {/* ── Status badge ── */}
                        <td className="px-3 md:px-4 py-3 md:py-3.5">
                          {getStatusBadge(file.status)}
                        </td>

                        {/* ── Actions ── */}
                        <td className="px-3 md:px-4 py-3 md:py-3.5">
                          <div className="flex items-center justify-end gap-1 lg:gap-1.5">
                            <button
                              onClick={() => {
                                if (file.status === "EXPIRED") {
                                  navigate("/share-expired");
                                  return;
                                }
                                if (file.status === "REVOKED") {
                                  navigate("/share-revoked");
                                  return;
                                }
                                handlePreview(file);
                              }}
                              title="Open file"
                              className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20 transition"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "15px" }}
                              >
                                open_in_new
                              </span>
                            </button>
                            <button
                              onClick={() => setRemoveTarget(file)}
                              disabled={removingId === file.id}
                              title="Remove from list"
                              className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition disabled:opacity-40"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "15px" }}
                              >
                                {removingId === file.id
                                  ? "hourglass_empty"
                                  : "close"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/*Mobile view — improved stacked cards*/}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredFiles.map((file) => {
                const avatarColors = getAvatarColors(file.sharedByName);
                return (
                  <div
                    key={file.id}
                    className="bg-[#111115] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-violet-500/20 transition-all duration-200 group"
                  >
                    {/* Card top — file info + action buttons */}
                    <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* File icon */}
                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span
                            className="material-symbols-outlined text-violet-400"
                            style={{ fontSize: "18px" }}
                          >
                            description
                          </span>
                        </div>
                        {/* File name */}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors truncate leading-snug">
                            {file.fileName}
                          </p>
                          {/* Sender row */}
                          <div className="flex items-center gap-1 mt-1.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-semibold ${avatarColors.bg} ${avatarColors.text}`}
                            >
                              {getInitials(file.sharedByName)}
                            </div>
                            <span className="text-xs text-slate-400 font-medium truncate flex-shrink-0 max-w-[35%]">
                              {file.sharedByName}
                            </span>
                            <span className="text-slate-600 text-xs flex-shrink-0">
                              ·
                            </span>
                            <span className="text-[11px] text-slate-500 truncate min-w-0">
                              {file.sharedByEmail}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons top-right */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            if (file.status === "EXPIRED") {
                              navigate("/share-expired");
                              return;
                            }
                            if (file.status === "REVOKED") {
                              navigate("/share-revoked");
                              return;
                            }
                            handlePreview(file);
                          }}
                          title="Open file"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20 transition"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "16px" }}
                          >
                            open_in_new
                          </span>
                        </button>
                        <button
                          onClick={() => setRemoveTarget(file)}
                          disabled={removingId === file.id}
                          title="Remove from list"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition disabled:opacity-50"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "16px" }}
                          >
                            {removingId === file.id
                              ? "hourglass_empty"
                              : "close"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Card footer — wraps to two rows on very narrow screens */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.04]">
                      {/* Expiry — takes available space, never pushes badges off screen */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="material-symbols-outlined text-slate-600 flex-shrink-0"
                          style={{ fontSize: "13px" }}
                        >
                          schedule
                        </span>
                        <span className="text-[11px] text-slate-500 truncate">
                          {getFormatDate(file.expiresAt)}
                        </span>
                      </div>

                      {/* Badges — always stay together, wrap below expiry if needed */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${
                            file.shareType === "PUBLIC"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                          }`}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "11px" }}
                          >
                            {file.shareType === "PUBLIC" ? "public" : "lock"}
                          </span>
                          {getShareTypeLabel(file.shareType)}
                        </span>
                        {getStatusBadge(file.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              itemLabel="shared files"
              searchQuery={searchQuery}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {removeTarget && (
        <ConfirmModal
          message={`Remove "${removeTarget.fileName}" from your Shared with Me list? The share link will still exist for the owner.`}
          onConfirm={() => handleRemove(removeTarget)}
          onCancel={() => setRemoveTarget(null)}
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

export default SharedWithMePage;
