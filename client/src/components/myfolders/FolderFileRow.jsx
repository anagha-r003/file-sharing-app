import { useState } from "react";
import { downloadFiles } from "../../services/fileService";
import { getFileMeta, formatSize, formatDate } from "../../utils/fileUtils";
import ActionMenu from "../../common/ui/ActionMenu";

function FolderFileRow({ file, onRemove, onView, onShare, onRename }) {
  const { icon, color, badge } = getFileMeta(file.name);

  // Track whether this row's menu is open so dots stay visible while menu is open
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleDownload(e) {
    e.stopPropagation();
    try {
      await downloadFiles([file.id]);
    } catch (err) {
      console.error("Download failed:", err);
    }
  }

  return (
    // Use `relative` so the ActionMenu can use `absolute` positioning
    // scoped to this row and escape the overflow of the parent list
    <div
      onClick={onView}
      className="group relative flex items-center gap-3 px-4 md:px-5 py-3.5 hover:bg-white/[0.02] transition"
    >
      {/* File Icon */}
      <div
        className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center ${color}`}
      >
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p
            className="text-[13px] font-medium text-white truncate"
            title={file.name}
          >
            {file.name}
          </p>
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

      {/* Action Menu
          - Always visible (opacity-100), no more hiding on non-hover rows
          - stopPropagation so clicking dots doesn't trigger onView
          - Pass onOpenChange so we can track open state for the overflow fix
      */}
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <ActionMenu
          onOpenChange={setMenuOpen}
          items={[
            {
              label: "Rename",
              icon: "edit",
              onClick: () => onRename?.(file),
            },
            {
              label: "Share",
              icon: "share",
              onClick: () => onShare?.(),
            },
            {
              label: "Remove",
              icon: "close",
              danger: true,
              onClick: () => onRemove?.(),
            },
          ]}
        />
      </div>
    </div>
  );
}

export default FolderFileRow;
