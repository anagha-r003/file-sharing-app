import { getFileMeta, formatSize, formatDate } from "../../utils/fileUtils";
import { downloadFiles } from "../../services/fileService";

function Checkbox({ checked, onChange, className = "" }) {
  return (
    <label
      className={`relative inline-flex items-center cursor-pointer ${className}`}
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
            : "border-slate-500 bg-transparent"
        }`}
      >
        {checked && (
          <svg
            className="w-2.5 h-2.5 text-white"
            viewBox="0 0 10 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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

function FileTableListView({
  paginated,
  search,
  selectedIds,
  hoveredId,
  onHover,
  onFileClick,
  onCheckboxChange,
  onToggleStar,
  allPageSelected,
  toggleSelectAll,
  onShare,
  onDelete,
  onFolder,
  onRename,
}) {
  const handleDownload = async (e, file) => {
    e.stopPropagation();

    try {
      await downloadFiles([file.id]);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <>
      {/* Desktop */}
      <div
        className="hidden md:block"
        style={{ overflowX: "auto", overflowY: "visible" }}
      >
        <table
          className="w-full text-sm min-w-[600px]"
          style={{ overflow: "visible" }}
        >
          <thead className="sticky top-0 z-10 bg-[#111827]">
            <tr className="border-b border-white/5">
              <th className="py-3 pl-6 pr-2 w-10">
                <Checkbox
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Name
              </th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"></th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Size
              </th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Uploaded On
              </th>
              <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-right pr-18">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-500">
                  {search
                    ? `No results matching "${search}"`
                    : "No files yet. Upload something!"}
                </td>
              </tr>
            ) : (
              paginated.map((file) => {
                const { icon, color, badge } = getFileMeta(file.name);
                const isSelected = selectedIds.includes(file.id);
                const isHovered = hoveredId === file.id;
                return (
                  <tr
                    key={file.id}
                    className="transition cursor-pointer group"
                    style={{
                      background: isSelected
                        ? "rgba(99,102,241,0.08)"
                        : undefined,
                    }}
                    onMouseEnter={() => onHover(file.id)}
                    onMouseLeave={() => onHover(null)}
                    onClick={() => onFileClick(file)}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3 pl-6 pr-2 w-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isHovered || isSelected ? (
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => onCheckboxChange(file.id, e)}
                        />
                      ) : null}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        {/* File icon */}
                        <div
                          className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${color}`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {icon}
                          </span>
                        </div>

                        {/* File info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="text-white font-medium truncate max-w-[160px] block"
                              title={file.name}
                            >
                              {file.name}
                            </span>

                            {/* Rename */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                if (onRename) {
                                  onRename(file);
                                }
                              }}
                              className="
            opacity-0
            group-hover:opacity-100
            transition
            text-slate-500
            hover:text-violet-400
            flex-shrink-0
          "
                              title="Rename"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                edit
                              </span>
                            </button>
                          </div>

                          <span className="text-slate-500 text-xs">You</span>
                        </div>
                      </div>
                    </td>
                    {/* Star */}
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(file);
                        }}
                        title={file.isStarred ? "Unstar" : "Star"}
                        className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-all ${
                          file.isStarred
                            ? "text-yellow-400"
                            : "text-slate-700 hover:text-yellow-400"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={{
                            fontVariationSettings: file.isStarred
                              ? "'FILL' 1"
                              : "'FILL' 0",
                          }}
                        >
                          star
                        </span>
                      </button>
                    </td>

                    {/* Size */}
                    <td className="py-3 px-6 text-slate-400 whitespace-nowrap">
                      {formatSize(file.size)}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-white/5">
                        {badge}
                      </span>
                    </td>

                    {/* Last Modified */}
                    <td className="py-3 px-6 text-slate-400 whitespace-nowrap">
                      {formatDate(file.createdAt || file.uploadedAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-6 whitespace-nowrap">
                      <div
                        className={`flex items-center justify-end gap-1.5 transition-opacity ${
                          isHovered || isSelected ? "opacity-100" : "opacity-40"
                        }`}
                      >
                        {/* Download */}
                        <button
                          onClick={(e) => handleDownload(e, file)}
                          title="Download"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 border border-white/5 hover:border-blue-500/30 transition"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            download
                          </span>
                        </button>

                        {/* Add to folder */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onFolder) onFolder(file);
                          }}
                          title="Add to folder"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 bg-white/5 hover:bg-violet-500/20 hover:text-violet-400 border border-white/5 hover:border-violet-500/30 transition"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            create_new_folder
                          </span>
                        </button>

                        {/* Share */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onShare) onShare(file);
                          }}
                          title="Share"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 bg-white/5 hover:bg-violet-500/20 hover:text-violet-400 border border-white/5 hover:border-violet-500/30 transition"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            share
                          </span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDelete) onDelete(file);
                          }}
                          title="Delete"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-white/5">
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            {search
              ? `No results matching "${search}"`
              : "No files yet. Upload something!"}
          </div>
        ) : (
          paginated.map((file) => {
            const { icon, color } = getFileMeta(file.name);
            const isSelected = selectedIds.includes(file.id);
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition"
                style={{
                  background: isSelected ? "rgba(99,102,241,0.08)" : undefined,
                }}
                onClick={() => onFileClick(file)}
              >
                {/* Checkbox */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0"
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => onCheckboxChange(file.id, e)}
                  />
                </div>

                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${color}`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {icon}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {file.name}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {formatSize(file.size)} ·{" "}
                    {formatDate(file.createdAt || file.uploadedAt)}
                  </p>
                </div>

                {/* Mobile actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Star */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleStar(file);
                    }}
                    title={file.isStarred ? "Unstar" : "Star"}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                      file.isStarred
                        ? "text-yellow-400"
                        : "text-slate-600 hover:text-yellow-400"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{
                        fontVariationSettings: file.isStarred
                          ? "'FILL' 1"
                          : "'FILL' 0",
                      }}
                    >
                      star
                    </span>
                  </button>
                  <button
                    onClick={(e) => handleDownload(e, file)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      download
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onShare) onShare(file);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-400/10 transition"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      share
                    </span>
                  </button>
                  {/* Rename */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (onRename) {
                        onRename(file);
                      }
                    }}
                    title="Rename"
                    className="
    w-8 h-8
    flex items-center justify-center
    rounded-lg
    text-slate-500
    hover:text-violet-400
    hover:bg-violet-400/10
    transition
  "
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      edit
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onDelete) onDelete(file);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default FileTableListView;
