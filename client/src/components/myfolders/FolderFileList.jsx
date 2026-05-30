import Card from "../../common/ui/Card";
import SearchInput from "../../common/ui/SearchInput";
import FolderFileRow from "./FolderFileRow";
import Pagination from "../../common/ui/Pagination";

function FileListSkeleton() {
  return (
    <div className="divide-y divide-white/[0.05]">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 md:px-5 py-3.5 animate-pulse"
        >
          <div className="w-9 h-9 rounded-xl bg-white/5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-3.5 bg-white/5 rounded w-2/5 mb-2" />
            <div className="h-3 bg-white/5 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyFiles({ search, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span
        className="material-symbols-outlined text-slate-700"
        style={{ fontSize: 48 }}
      >
        folder_open
      </span>
      {search ? (
        <>
          <p className="text-slate-400 text-sm">
            No files matching <span className="text-white">"{search}"</span>
          </p>
          <button
            onClick={onClear}
            className="text-violet-400 hover:text-violet-300 text-sm transition"
          >
            Clear search
          </button>
        </>
      ) : (
        <p className="text-slate-400 text-sm">No files in this folder yet</p>
      )}
    </div>
  );
}

function FolderFileList({
  files,
  loading,
  search,
  onSearchChange,
  onSearchClear,
  onRemove,
  onView,
  onShare,
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}) {
  return (
    <Card className="!p-0 overflow-hidden">
      {/* Search — only if files exist */}
      {!loading && files.length > 0 && (
        <div className="px-4 md:px-5 py-3.5 border-b border-white/5">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            onClear={onSearchClear}
            placeholder="Search in folder..."
            className="w-full sm:w-64"
          />
        </div>
      )}

      {loading ? (
        <FileListSkeleton />
      ) : files.length === 0 ? (
        <EmptyFiles search={search} onClear={onSearchClear} />
      ) : (
        <>
          <div className="divide-y divide-white/[0.05]">
            {files.map((file) => (
              <FolderFileRow
                key={file.id}
                file={file}
                onRemove={() => onRemove(file)}
                onView={() => onView(file)}
                onShare={() => onShare(file)}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            itemLabel="files"
            onPageChange={onPageChange}
          />
        </>
      )}
    </Card>
  );
}

export default FolderFileList;
