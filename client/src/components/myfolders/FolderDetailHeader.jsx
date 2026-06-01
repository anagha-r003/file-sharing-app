import { useNavigate } from "react-router-dom";
import Card from "../../common/ui/Card";

function FolderDetailHeader({ folder, fileCount }) {
  const navigate = useNavigate();

  return (
    <Card className="flex items-center justify-between !p-3 md:!p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/my-folders")}
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center
                     rounded-lg bg-white/5 hover:bg-white/10
                     text-slate-400 hover:text-white transition"
        >
          <span className="material-symbols-outlined text-base">
            chevron_left
          </span>
        </button>

        {folder && (
          <div
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl"
            style={{ background: `${folder.color}22` }}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ color: folder.color }}
            >
              folder
            </span>
          </div>
        )}

        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-white truncate">
            {folder?.name ?? "—"}
          </p>
          <p className="text-[12px] text-white/30">
            {fileCount} {fileCount === 1 ? "file" : "files"}
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate("/my-files")}
        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500
                   rounded-xl text-white text-sm font-semibold transition
                   shadow-lg shadow-violet-600/20 flex-shrink-0"
      >
        Add files
      </button>
    </Card>
  );
}

export default FolderDetailHeader;
