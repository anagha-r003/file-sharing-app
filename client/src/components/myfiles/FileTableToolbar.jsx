import { PAGE_SIZE_OPTIONS } from "../../common/constants/fileTypes";

function FileTableToolbar({
  search,
  onSearchChange,
  onSearchClear,
  selectedCount,

  pageSize,
  onPageSizeChange,

  view,
  onViewChange,

  onBulkDownload,
  onBulkShare,
  onBulkDelete,
  onClearSelection,

  bulkDeleting,
}) {
  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 px-4 md:px-6 py-5 border-b border-white/5">
      {/* Search */}
      <div className="relative w-full sm:w-64 md:w-80">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base">
          search
        </span>

        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder="Search your vault..."
          className="w-full bg-[#111] border border-white/10 rounded-xl text-white text-sm py-2.5 pl-10 pr-4 outline-none focus:border-violet-500/50 transition placeholder:text-slate-600 shadow-inner"
        />

        {search && (
          <button
            onClick={onSearchClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center justify-between xl:justify-end gap-3 w-full xl:w-auto">
        {selectedCount > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white mr-2">
              {selectedCount} selected
            </span>

            <button
              onClick={onBulkDownload}
              title="Download selected"
              className="p-2 rounded-lg text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/20 transition"
            >
              <span className="material-symbols-outlined text-base">
                download
              </span>
            </button>

            <button
              onClick={onBulkShare}
              title="Share selected"
              className="p-2 rounded-lg text-violet-400 bg-violet-400/10 hover:bg-violet-400/20 border border-violet-400/20 transition"
            >
              <span className="material-symbols-outlined text-base">share</span>
            </button>

            <button
              onClick={onBulkDelete}
              disabled={bulkDeleting}
              title="Delete selected"
              className="p-2 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 transition disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">
                delete
              </span>
            </button>

            <button
              onClick={onClearSelection}
              title="Clear selection"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ) : (
          <>
            {/* Page Size */}
            <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium">
              <span className="hidden sm:inline">Show</span>

              <select
                value={pageSize}
                onChange={onPageSizeChange}
                className="bg-[#111] border border-white/10 rounded-lg text-white px-2 py-1.5 outline-none hover:border-white/20 transition cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/5 rounded-xl p-1">
              <button
                onClick={() => onViewChange("list")}
                className={`p-2 rounded-lg transition-all ${
                  view === "list"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-lg">list</span>
              </button>

              <button
                onClick={() => onViewChange("grid")}
                className={`p-2 rounded-lg transition-all ${
                  view === "grid"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  grid_view
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FileTableToolbar;
