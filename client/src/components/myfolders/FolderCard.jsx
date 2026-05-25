import { formatDate } from "../../utils/fileUtils";

function FolderCard({ folder, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-white/[0.02] hover:bg-white/[0.05]
                 border border-white/5 hover:border-white/15 rounded-2xl p-5
                 cursor-pointer transition-all duration-200"
    >
      {/* Delete icon on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center
     rounded-xl bg-white/[0.04] border border-white/5
     text-slate-500 hover:text-red-400 hover:bg-red-500/10
     hover:border-red-500/20
     opacity-100 md:opacity-0 md:group-hover:opacity-100
     transition-all duration-200 z-10"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>

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
