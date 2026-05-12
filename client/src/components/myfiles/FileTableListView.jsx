import { getFileMeta, formatSize, formatDate } from "../../utils/fileUtils";

const CB =
  "w-4 h-4 cursor-pointer appearance-none rounded border border-slate-500 checked:bg-violet-600 checked:border-violet-600 bg-transparent transition";

function FileTableListView({
  paginated,
  search,
  files,
  selectedIds,
  hoveredId,
  onHover,
  onFileClick,
  onCheckboxChange,
  onToggleStar,
}) {
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
                <input
                  type="checkbox"
                  className={CB}
                  disabled
                  title="Select all on current page"
                />
              </th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Name
              </th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Size
              </th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Last Modified
              </th>
              <th className="py-3 px-2" />
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
                    className="transition cursor-pointer"
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
                      {(isHovered || isSelected) && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onCheckboxChange(file.id, e)}
                          className={CB}
                        />
                      )}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div
                          className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${color}`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {icon}
                          </span>
                        </div>
                        <span
                          className="text-white font-medium truncate max-w-[160px]"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                      </div>
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

                    {/* Star */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(file);
                        }}
                        className={`p-1 rounded-lg transition-colors ${file.isStarred ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400"}`}
                        title={file.isStarred ? "Unstar" : "Star"}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {file.isStarred ? "star" : "star_outline"}
                        </span>
                      </button>
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
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onCheckboxChange(file.id, e)}
                    className={CB}
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

                {/* Star */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleStar(file);
                  }}
                  className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${file.isStarred ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400"}`}
                  title={file.isStarred ? "Unstar" : "Star"}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {file.isStarred ? "star" : "star_outline"}
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default FileTableListView;
