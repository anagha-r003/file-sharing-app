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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Files Shared Directly with You
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              View files shared to your account, including public and
              restricted links.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search shared files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#13131a] border border-white/5 rounded-xl text-slate-200 text-sm pl-10 pr-4 py-2.5 outline-none focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/20 placeholder:text-slate-600 transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="animate-pulse font-medium text-slate-400">
              Loading files shared with you...
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-white/5 bg-[#111115]/50">
            <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">
              folder_shared
            </span>
            <h3 className="text-lg font-bold text-slate-400">
              No shared files found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Files shared directly to your email will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop view: Table */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/5 bg-[#111115]">
              <table className="w-full text-left border-collapse min-w-[820px]">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider bg-white/[0.01]">
                    <th className="px-6 py-4">File Name</th>
                    <th className="px-6 py-4">Shared By</th>
                    <th className="px-6 py-4">Access</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Expiry Date</th>
                    <th className="px-6 py-4 text-right pr-13">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-violet-400 bg-violet-500/10 p-2 rounded-xl text-xl flex-shrink-0">
                            description
                          </span>
                          <div className="truncate">
                            <span className="font-semibold text-white group-hover:text-violet-400 transition truncate block">
                              {file.fileName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-medium text-slate-200 block">
                            {file.sharedByName}
                          </span>
                          <span className="text-xs text-slate-500 block mt-0.5">
                            {file.sharedByEmail}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                            file.shareType === "PUBLIC"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {file.shareType === "PUBLIC" ? "public" : "lock"}
                          </span>
                          {getShareTypeLabel(file.shareType)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(file.status)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-slate-400">
                          {getFormatDate(file.expiresAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
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
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2a2542] hover:bg-[#342e52] text-[#a78bfa] text-xs font-medium rounded-lg transition-colors"
                          >
                            <span
                              className="material-symbols-outlined text-sm"
                              style={{ fontSize: "16px" }}
                            >
                              open_in_new
                            </span>
                            Open
                          </button>
                          <button
                            onClick={() => setRemoveTarget(file)}
                            disabled={removingId === file.id}
                            title="Remove from list"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-base">
                              {removingId === file.id
                                ? "hourglass_empty"
                                : "close"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view: Stacked Card Grid */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-[#111115] border border-white/5 rounded-2xl p-4 space-y-4 hover:border-violet-500/20 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-violet-400 bg-violet-500/10 p-2 rounded-xl text-xl flex-shrink-0">
                        description
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-white group-hover:text-violet-400 transition truncate block text-sm">
                          {file.fileName}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5 truncate">
                          by {file.sharedByName}
                        </span>
                        <span className="text-[10px] text-slate-600 block mt-0.5 truncate">
                          {file.sharedByEmail}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                        file.shareType === "PUBLIC"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs" style={{ fontSize: "14px" }}>
                        {file.shareType === "PUBLIC" ? "public" : "lock"}
                      </span>
                      {getShareTypeLabel(file.shareType)}
                    </span>

                    {getStatusBadge(file.status)}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="text-[11px] text-slate-500">
                      Expires:{" "}
                      <span className="text-slate-300 font-medium">
                        {getFormatDate(file.expiresAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
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
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#2a2542] hover:bg-[#342e52] text-[#a78bfa] text-xs font-medium rounded-lg transition-colors"
                      >
                        <span
                          className="material-symbols-outlined text-xs"
                          style={{ fontSize: "14px" }}
                        >
                          open_in_new
                        </span>
                        Open
                      </button>
                      <button
                        onClick={() => setRemoveTarget(file)}
                        disabled={removingId === file.id}
                        title="Remove from list"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-base">
                          {removingId === file.id
                            ? "hourglass_empty"
                            : "close"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
