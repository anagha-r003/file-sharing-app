import { useEffect, useState } from "react";

function RenameModal({ isOpen, currentName, type = "file", onClose, onSave }) {
  const [value, setValue] = useState("");

  const dotIndex = currentName?.lastIndexOf(".") ?? -1;

  const extension =
    type === "file" && dotIndex !== -1 ? currentName.substring(dotIndex) : "";

  const baseName =
    type === "file" && dotIndex !== -1
      ? currentName.substring(0, dotIndex)
      : currentName;

  useEffect(() => {
    setValue(baseName || "");
  }, [currentName]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = value.trim();

    if (!trimmed) return;

    const finalName = trimmed + extension;

    if (finalName === currentName) {
      onClose();
      return;
    }

    onSave(finalName);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div
        className="w-full max-w-md rounded-2xl border border-white/10
                   bg-[#111827] shadow-2xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">Rename</h2>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Input */}
        <div className="flex items-center border border-violet-500 rounded-xl overflow-hidden bg-slate-900">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave();
              }

              if (e.key === "Escape") {
                onClose();
              }
            }}
            className="flex-1 bg-transparent px-4 py-3 text-white outline-none"
          />

          {extension && (
            <span className="pr-4 text-slate-400 text-sm">{extension}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default RenameModal;
