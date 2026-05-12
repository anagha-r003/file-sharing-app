import { useState, useMemo } from "react";
import { revokeShareLink } from "../../services/shareService";
import Pagination from "../../common/ui/Pagination";
// Import your component here
import { SearchInput } from "../../common/ui";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
};

function SharedLinksTable({ sharedLinks = [], onRefresh, showToast }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sharedLinks;
    return sharedLinks.filter(
      (l) =>
        l.fileName?.toLowerCase().includes(q) ||
        l.recipientEmail?.toLowerCase().includes(q),
    );
  }, [sharedLinks, search]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleRevoke = async (shareId) => {
    const link = sharedLinks.find((l) => l.id === shareId);
    if (
      !link ||
      link.active === false ||
      new Date(link.expiryDate) <= new Date()
    ) {
      showToast?.("Link already inactive");
      return;
    }
    try {
      await revokeShareLink(shareId);
      showToast?.("Share link revoked!");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to revoke share link", error);
      showToast?.("Failed to revoke link");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 sm:p-6 text-slate-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Sharing history
          </h1>
          <p className="text-sm sm:text-base text-slate-500">
            Manage active and expired share links to your files.
          </p>
        </header>

        {/* Integrated SearchInput Component */}
        <div className="bg-[#161618] border border-white/5 rounded-2xl p-3 sm:p-4 mb-6">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            placeholder="Search by file or recipient..."
            className="w-full"
          />
        </div>

        <div className="bg-[#161618] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-1.5 sm:p-2 space-y-2">
            {paginated.length > 0 ? (
              paginated.map((link) => {
                const isExpired = new Date(link.expiryDate) <= new Date();
                const isRevoked = link.active === false;
                const isActive = !isExpired && !isRevoked;

                return (
                  <div
                    key={link.id}
                    className="group flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all gap-4"
                  >
                    {/* Info Section */}
                    <div className="flex flex-col gap-1.5 w-full lg:w-auto">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-white font-semibold text-base sm:text-lg truncate max-w-[200px] sm:max-w-md">
                          {link.fileName}
                        </h3>
                        {isActive ? (
                          <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                            Active
                          </span>
                        ) : (
                          <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                            Expired
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-500">
                        <span className="truncate max-w-[180px] sm:max-w-none">
                          Shared with{" "}
                          <span className="text-slate-400">
                            {link.recipientEmail}
                          </span>
                        </span>
                        <span className="hidden sm:inline text-slate-700">
                          •
                        </span>
                        <span className="whitespace-nowrap">
                          {isExpired
                            ? `Expired ${formatDate(link.expiryDate)}`
                            : `Expires ${formatDate(link.expiryDate)}`}
                        </span>
                        <span className="hidden sm:inline text-slate-700">
                          •
                        </span>
                        <span className="whitespace-nowrap">
                          Created {link.createdAt || "recent"}
                        </span>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto lg:justify-end">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(link.shareUrl);
                          showToast?.("Link copied!");
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#2a2a2e] hover:bg-[#36363a] text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-base sm:text-lg">
                          content_copy
                        </span>
                        Copy
                      </button>

                      <button
                        onClick={() => window.open(link.shareUrl, "_blank")}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#312e4d] hover:bg-[#3d3a5c] text-[#a5b4fc] text-xs sm:text-sm font-medium rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-base sm:text-lg">
                          open_in_new
                        </span>
                        Open
                      </button>

                      <button
                        disabled={!isActive}
                        onClick={() => handleRevoke(link.id)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                          !isActive
                            ? "bg-transparent text-slate-600 cursor-not-allowed opacity-50"
                            : "bg-[#351e1e] hover:bg-[#4a2626] text-red-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base sm:text-lg">
                          link_off
                        </span>
                        Revoke
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                No shared links found matching your search.
              </div>
            )}
          </div>

          <div className="border-t border-white/5 p-4 overflow-x-auto">
            <Pagination
              page={page}
              setPage={setPage}
              totalItems={filtered.length}
              pageSize={pageSize}
              label={search ? "results" : "shared links"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharedLinksTable;
