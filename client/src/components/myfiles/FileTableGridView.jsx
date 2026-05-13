import { getFileMeta, formatSize } from "../../utils/fileUtils";

function Checkbox({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
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

function FileTableGridView({
  paginated,
  search,
  selectedIds,
  onFileClick,
  onCheckboxChange,
  onToggleStar,
}) {
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
                  className="group relative flex flex-col rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/5 cursor-pointer transition overflow-hidden"
                  style={{
                    outline: isSelected
                      ? "2px solid rgb(99,102,241)"
                      : undefined,
                  }}
                >
                  {/* Checkbox — top left, hover only */}
                  <div
                    className={`absolute top-2 left-2 z-10 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => onCheckboxChange(file.id, e)}
                    />
                  </div>

                  {/* Star — top right, hover only unless starred */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleStar(file);
                    }}
                    className={`absolute top-2 right-2 z-10 p-1 rounded-lg bg-black/40 transition-all ${
                      file.isStarred
                        ? "opacity-100 text-yellow-400"
                        : "opacity-0 group-hover:opacity-100 text-white hover:text-yellow-400"
                    }`}
                    title={file.isStarred ? "Unstar" : "Star"}
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: file.isStarred ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>

                  {/* Preview / Icon */}
                  {hasPreview ? (
                    <div className="w-full h-24 md:h-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                      <img
                        src={`http://localhost:8080/files/${file.id}/preview`}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className={`w-full h-full hidden items-center justify-center ${color}`}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 36 }}
                        >
                          {icon}
                        </span>
                      </div>
                    </div>
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

                  {/* Info */}
                  <div className="p-2 md:p-3">
                    <p
                      className="text-white text-xs font-medium truncate w-full mb-1"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-slate-500 text-xs">
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