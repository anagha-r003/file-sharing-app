import { useState, useMemo } from "react";
import { revokeShareLink } from "../../services/shareService";
import Pagination from "../../common/ui/Pagination";
import { SearchInput } from "../../common/ui";
import FileViewModal from "../myfiles/FileViewModal";
import { downloadFiles } from "../../services/fileService";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
};

const formatRelative = (dateStr) => {
  if (!dateStr) return "recent";

  const date = new Date(dateStr);
  const now = new Date();

  const diffMs = now - date;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1d ago";

  return `${diffDays}d ago`;
};

const badgeClass =
  "inline-flex items-center justify-center w-[112px] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap";

function LinkStatusBadges({ isActive, isExpired, isRevoked, accessed }) {
  const linkLabel = isActive ? "Active" : isExpired ? "Expired" : "Revoked";
  const linkClass = isActive
    ? `${badgeClass} bg-green-500/15 text-green-400`
    : isExpired
      ? `${badgeClass} bg-orange-500/15 text-orange-400`
      : `${badgeClass} bg-red-500/15 text-red-400`;

  return (
    <div className="inline-grid grid-cols-2 gap-x-2 items-center lg:mx-auto">
      <span className={linkClass}>{linkLabel}</span>

      <span
        className={
          accessed
            ? `${badgeClass} bg-amber-500/15 text-amber-400`
            : `${badgeClass} bg-slate-500/15 text-slate-400`
        }
      >
        {accessed ? "Accessed" : "Not accessed"}
      </span>
    </div>
  );
}

function SharedLinksTable({
  sharedLinks = [],
  onRefresh,
  showToast,

  // NEW
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  const [search, setSearch] = useState("");

  const [previewFile, setPreviewFile] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return sharedLinks;

    return sharedLinks.filter(
      (l) =>
        l.fileName?.toLowerCase().includes(q) ||
        l.recipientEmail?.toLowerCase().includes(q),
    );
  }, [sharedLinks, search]);

  const handleRevoke = async (shareId) => {
    const link = sharedLinks.find((l) => l.id === shareId);

    if (
      !link ||
      link.active === false ||
      new Date(link.expiryDate) <= new Date()
    ) {
      showToast?.("Link already inactive", "error");

      return;
    }

    try {
      await revokeShareLink(shareId);

      showToast?.("Share link revoked!", "success");

      onRefresh?.();
    } catch (error) {
      console.error("Failed to revoke share link", error);

      showToast?.("Failed to revoke link", "error");
    }
  };

  return (
    <div className="text-slate-300">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          Sharing history
        </h1>

        <p className="text-sm text-slate-500">
          Manage active and expired share links to your files.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="Search by file or recipient..."
          className="w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111114] border border-white/[0.06] rounded-2xl overflow-hidden">
        {filtered.length > 0 && (
          <div className="hidden lg:grid grid-cols-[minmax(0,1fr)_232px_minmax(0,1fr)] gap-4 px-5 py-3 border-b border-white/[0.05] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span>File</span>
            <span className="text-center">Status</span>
            <span className="text-right">Actions</span>
          </div>
        )}

        <div className="divide-y divide-white/[0.05]">
          {filtered.length > 0 ? (
            filtered.map((link) => {
              const isActive = link.status === "ACTIVE";

              const isExpired = link.status === "EXPIRED";

              const isRevoked = link.status === "REVOKED";

              return (
                <div
                  key={link.id}
                  className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_232px_minmax(0,1fr)] gap-3 lg:gap-4 lg:items-center px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-white font-semibold text-base truncate">
                      {link.fileName}
                    </span>

                    <p className="text-xs text-slate-500">
                      Shared with{" "}
                      <span className="text-slate-400 font-medium">
                        {link.recipientEmail}
                      </span>
                      {" · "}
                      {isRevoked
                        ? `Revoked ${formatDate(link.expiryDate)}`
                        : isExpired
                          ? `Expired ${formatDate(link.expiryDate)}`
                          : `Expires ${formatDate(link.expiryDate)}`}
                      {" · "}
                      Created {formatRelative(link.createdAt)}
                    </p>
                  </div>

                  <LinkStatusBadges
                    isActive={isActive}
                    isExpired={isExpired}
                    isRevoked={isRevoked}
                    accessed={link.accessed}
                  />

                  <div className="flex items-center gap-2 flex-shrink-0 lg:justify-end lg:col-start-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(link.shareUrl);

                        showToast?.("Link copied!", "success");
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#26262b] hover:bg-[#303036] text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Copy
                    </button>

                    <button
                      onClick={() =>
                        setPreviewFile({
                          id: link.fileId,
                          name: link.fileName,
                          size: 0,
                        })
                      }
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2a2542] hover:bg-[#342e52] text-[#a78bfa] text-xs font-medium rounded-lg transition-colors"
                    >
                      Open
                    </button>

                    <button
                      disabled={!isActive}
                      onClick={() => handleRevoke(link.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                        !isActive
                          ? "text-slate-600 cursor-not-allowed opacity-40 bg-transparent"
                          : "bg-[#2e1a1a] hover:bg-[#3d2222] text-red-400"
                      }`}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-slate-600 text-sm">
              No shared links found.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="border-t border-white/[0.05] px-5 py-3">
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            itemLabel="links"
            searchQuery={search}
            onPageChange={onPageChange}
          />
        </div>
      </div>

      {previewFile && (
        <FileViewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={() => downloadFiles([previewFile.id])}
        />
      )}
    </div>
  );
}

export default SharedLinksTable;
