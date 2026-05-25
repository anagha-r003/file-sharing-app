import { downloadFiles } from "../../services/fileService";
import { getFileMeta, formatSize, formatDate } from "../../utils/fileUtils";

function FolderFileRow({ file, onRemove, onView }) {
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
      className="group flex items-center gap-3 px-4 md:px-5 py-3.5
                    hover:bg-white/[0.02] transition"
    >
      <div
        className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center ${color}`}
      >
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white truncate">
          {file.name}
        </p>
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

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove from vault"
        className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full
                   bg-white/[0.06] hover:bg-red-500/20 text-white/35 hover:text-red-400
                   border border-white/5 hover:border-red-500/20
                   opacity-0 group-hover:opacity-100 transition-all"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

export default FolderFileRow;
