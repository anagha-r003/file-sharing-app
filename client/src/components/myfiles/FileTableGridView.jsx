import { getFileMeta, formatSize } from "../../utils/fileUtils";
import { useAuthBlob } from "../../hooks/UseAuthBlob";
import ActionMenu from "../../common/ui/ActionMenu";

function Checkbox({ checked, onChange }) {
  return (
    <label
      className="relative inline-flex items-center cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div
        className={`w-4 h-4 rounded border transition flex items-center justify-center flex-shrink-0 ${
          checked
            ? "bg-violet-600 border-violet-600"
            : "border-slate-500 bg-black/40"
        }`}
      >
        {checked && (
          <svg
            className="w-2.5 h-2.5 text-white"
            viewBox="0 0 10 8"
            fill="none"
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </label>
  );
}

function FilePreviewImage({ file, icon, color }) {
  const { blobUrl } = useAuthBlob(`/files/preview/${file.id}`, true);
  if (!blobUrl) {
    return (
      <div
        className={`w-full h-24 md:h-32 flex items-center justify-center ${color}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
          {icon}
        </span>
      </div>
    );
  }
  return (
    <div className="w-full h-24 md:h-32 bg-slate-900 overflow-hidden">
      <img
        src={blobUrl}
        alt={file.name}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function FileTableGridView({
  paginated,
  search,
  selectedIds,
  onFileClick,
  onCheckboxChange,
  onToggleStar,
  onRename,
  onRemove,
  onShare,
}) {
  const hasActions = onRename || onShare || onRemove;

  return (
    <div className="p-4 md:p-6">
      {paginated.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Files
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
            {paginated.map((file) => {
              const { icon, color, hasPreview } = getFileMeta(file.name);
              const isSelected = selectedIds.includes(file.id);

              return (
                <div
                  key={file.id}
                  onClick={() => onFileClick(file)}
                  className="group relative flex flex-col rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/5 cursor-pointer transition"
                  style={{
                    outline: isSelected
                      ? "2px solid rgb(99,102,241)"
                      : undefined,
                    overflow: "visible",
                  }}
                >
                  {/* ── Preview zone (clips to rounded top corners) ── */}
                  <div className="rounded-t-xl overflow-hidden relative">
                    {hasPreview ? (
                      <FilePreviewImage file={file} icon={icon} color={color} />
                    ) : (
                      <div
                        className={`w-full h-24 md:h-32 flex items-center justify-center ${color}`}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 36 }}
                        >
                          {icon}
                        </span>
                      </div>
                    )}

                    {/* Gradient strip for readability of overlaid controls */}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    {/* Checkbox — bottom-left of preview */}
                    <div
                      className={`absolute bottom-2 left-2 z-10 transition-opacity ${
                        isSelected
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => onCheckboxChange(file.id, e)}
                      />
                    </div>

                    {/* Star — bottom-right of preview */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleStar(file);
                      }}
                      className={`absolute bottom-2 right-2 z-10 p-0.5 rounded transition-all ${
                        file.isStarred
                          ? "opacity-100 text-yellow-400"
                          : "opacity-100 md:opacity-0 md:group-hover:opacity-100 text-white hover:text-yellow-400"
                      }`}
                      title={file.isStarred ? "Unstar" : "Star"}
                    >
                      <span
                        className="material-symbols-outlined text-[18px] drop-shadow-md"
                        style={{
                          fontVariationSettings: file.isStarred
                            ? "'FILL' 1"
                            : "'FILL' 0",
                        }}
                      >
                        star
                      </span>
                    </button>
                  </div>

                  {/*
                    ── Info strip ────────────────────────────────────────────
                    Layout:
                      row 1: filename (full width, truncated)
                      row 2: size (left)  •  ⋮ action menu (right)

                    Putting the 3-dot on the SECOND line (next to size) means
                    the filename always gets full width — no competition for space.
                  */}
                  <div className="px-2 md:px-3 pt-2 pb-1.5 md:pt-2.5 md:pb-2">
                    {/* Row 1 — filename + action menu */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p
                        className="text-white text-xs font-medium truncate flex-1 min-w-0"
                        title={file.name}
                      >
                        {file.name}
                      </p>

                      {hasActions && (
                        <div
                          className="flex-shrink-0 -mr-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ActionMenu
                            align="right"
                            items={[
                              ...(onRename
                                ? [
                                    {
                                      label: "Rename",
                                      icon: "edit",
                                      onClick: () => onRename(file),
                                    },
                                  ]
                                : []),

                              ...(onShare
                                ? [
                                    {
                                      label: "Share",
                                      icon: "share",
                                      onClick: () => onShare(file),
                                    },
                                  ]
                                : []),

                              ...(onRemove
                                ? [
                                    {
                                      label: "Remove",
                                      icon: "close",
                                      danger: true,
                                      onClick: () => onRemove(file),
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        </div>
                      )}
                    </div>

                    {/* Row 2 — size */}
                    <p className="text-slate-500 text-[11px]">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {paginated.length === 0 && (
        <div className="py-16 text-center text-slate-500 text-sm">
          {search
            ? `No results matching "${search}"`
            : "No files yet. Upload something!"}
        </div>
      )}
    </div>
  );
}

export default FileTableGridView;
