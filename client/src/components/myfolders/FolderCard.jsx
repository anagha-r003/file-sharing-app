import { formatDate } from "../../utils/fileUtils";
import ActionMenu from "../../common/ui/ActionMenu";

function FolderCard({ folder, onClick, onDelete, onRename }) {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-white/[0.02] hover:bg-white/[0.05]
                 border border-white/5 hover:border-white/15 rounded-2xl p-5
                 cursor-pointer transition-all duration-200"
    >
      {/* Action Menu */}
      <div className="absolute top-3 right-3 z-10">
        <ActionMenu
          items={[
            {
              label: "Rename",
              icon: "edit",
              onClick: (e) => {
                e?.stopPropagation();
                onRename?.();
              },
            },

            {
              label: "Delete",
              icon: "delete",
              danger: true,
              onClick: (e) => {
                e?.stopPropagation();
                onDelete?.();
              },
            },
          ]}
        />
      </div>

      {/* Folder icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-8 flex-shrink-0"
        style={{ background: `${folder.color}22` }}
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ color: folder.color }}
        >
          folder
        </span>
      </div>

      {/* Info */}
      <p className="text-[15px] font-semibold text-[#e8e8f0] mb-1 truncate">
        {folder.name}
      </p>

      <p className="text-[12px] text-white/30">
        {folder.filesCount ?? 0}{" "}
        {(folder.filesCount ?? 0) === 1 ? "file" : "files"} · created{" "}
        {formatDate(folder.createdAt)}
      </p>
    </div>
  );
}

export default FolderCard;
