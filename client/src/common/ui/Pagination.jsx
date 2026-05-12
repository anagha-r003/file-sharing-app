import { getPaginationRange } from "../../utils/formatUtils";

function Pagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  itemLabel = "items",
  searchQuery = "",
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPaginationRange(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-6 py-4 border-t border-white/5">
      {/* Info */}
      <p className="text-slate-500 text-xs md:text-sm text-center sm:text-left">
        Showing{" "}
        <span className="text-white font-medium">
          {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}
        </span>{" "}
        to{" "}
        <span className="text-white font-medium">
          {Math.min(page * pageSize, totalItems)}
        </span>{" "}
        of <span className="text-white font-medium">{totalItems}</span>{" "}
        {searchQuery ? "results" : itemLabel}
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Prev
        </button>

        {/* First Page */}
        {pageNumbers.length > 0 && pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs md:text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              1
            </button>

            {pageNumbers[0] > 2 && (
              <span className="text-slate-600 px-1">...</span>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs md:text-sm font-medium transition ${
              p === page
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {p}
          </button>
        ))}

        {/* Last Page */}
        {pageNumbers.length > 0 &&
          pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="text-slate-600 px-1">...</span>
              )}

              <button
                onClick={() => onPageChange(totalPages)}
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs md:text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                {totalPages}
              </button>
            </>
          )}

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
