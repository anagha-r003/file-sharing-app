import { downloadFiles } from "../../services/fileService";
import { getFileMeta, formatSize, formatDate } from "../../utils/fileUtils";

function FolderFileRow({ file, onRemove, onView, onShare, onRename }) {
  const { icon, color, badge } = getFileMeta(file.name);

  async function handleDownload(e) {
    e.stopPropagation();
    try {
      await downloadFiles([file.id]);
    } catch (err) {
      console.error("Download failed:", err);
    }
  }

  return (
    <div
      onClick={onView}
      className="group flex items-center gap-3 px-4 md:px-5 py-3.5 hover:bg-white/[0.02] transition"
    >
      <div
        className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center ${color}`}
      >
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p
            className="text-[13px] font-medium text-white truncate"
            title={file.name}
          >
            {file.name}
          </p>

          {/* Rename */}
          <button
            onClick={(e) => {
              e.stopPropagation();

              if (onRename) {
                onRename(file);
              }
            }}
            title="Rename"
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition text-white/35 hover:text-violet-400 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${color}`}
          >
            {badge}
          </span>
          <span className="text-[11px] text-white/30">
            {formatSize(file.size)} ·{" "}
            {formatDate(file.createdAt || file.uploadedAt)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
        {/* Share */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          title="Share file"
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-violet-500/20 text-white/35 hover:text-violet-400 border border-white/5 hover:border-violet-500/20 transition-all"
        >
          <span className="material-symbols-outlined text-sm">share</span>
        </button>

        {/* Remove */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remove from vault"
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-red-500/20 text-white/35 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}

export default FolderFileRow;
