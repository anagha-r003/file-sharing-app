import SearchInput from "../../common/ui/SearchInput";
import Card from "../../common/ui/Card";

function FolderToolbar({
  search,
  onSearchChange,
  onSearchClear,
  folderCount,
  onCreate,
}) {
  return (
    <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 !p-4 md:!p-5">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        onClear={onSearchClear}
        placeholder="Search folders..."
        className="w-full sm:w-64 md:w-80"
      />

      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
        <span className="text-sm text-slate-500">
          {folderCount} {folderCount === 1 ? "folder" : "folders"}
        </span>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500
                     rounded-xl text-white text-sm font-semibold transition
                     shadow-lg shadow-violet-600/20"
        >
          <span className="material-symbols-outlined text-base">
            create_new_folder
          </span>
          New folder
        </button>
      </div>
    </Card>
  );
}

export default FolderToolbar;
