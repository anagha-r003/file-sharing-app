import Card from "../../common/ui/Card";
import FolderCard from "./FolderCard";

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/[0.02] border border-white/5 p-5 animate-pulse"
        >
          <div className="w-12 h-12 rounded-xl bg-white/5 mb-8" />
          <div className="h-4 bg-white/5 rounded-lg w-3/4 mb-2" />
          <div className="h-3 bg-white/5 rounded-lg w-1/2" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search, onClear, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span
        className="material-symbols-outlined text-slate-700"
        style={{ fontSize: 56 }}
      >
        folder_open
      </span>
      {search ? (
        <>
          <p className="text-slate-400 text-sm">
            No vaults matching <span className="text-white">"{search}"</span>
          </p>
          <button
            onClick={onClear}
            className="text-violet-400 hover:text-violet-300 text-sm transition"
          >
            Clear search
          </button>
        </>
      ) : (
        <>
          <p className="text-slate-400 text-sm">
            You haven't created any vaults yet
          </p>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600
                       hover:bg-violet-500 rounded-xl text-white text-sm font-semibold transition"
          >
            <span className="material-symbols-outlined text-base">
              create_new_folder
            </span>
            New vault
          </button>
        </>
      )}
    </div>
  );
}

function FolderGrid({
  folders,
  loading,
  search,
  onClear,
  onCreate,
  onOpen,
  onDelete,
  onRename,
}) {
  return (
    <Card className="!p-4 md:!p-6">
      {loading ? (
        <SkeletonGrid />
      ) : folders.length === 0 ? (
        <EmptyState search={search} onClear={onClear} onCreate={onCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onClick={() => onOpen(folder)}
              onDelete={() => onDelete(folder)}
              onRename={() => onRename(folder)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export default FolderGrid;
