import { X, Check } from "lucide-react";
import { useState } from "react";
import { createFolder } from "../../services/folderService";

const COLORS = [
  "#A855F7",
  "#3B82F6",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];

export default function CreateFolderModal({
  file,
  onClose,
  onBack,
  onCreated,
}) {
  const [folderName, setFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [error, setError] = useState(false);
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!folderName.trim()) {
      setError(true);
      return;
    }

    try {
      setCreating(true);

      await createFolder({
        name: folderName.trim(),
        color: selectedColor,
      });

      onCreated?.();
    } catch (err) {
      console.error("Folder create failed", err);
    } finally {
      setCreating(false);
    }
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-[calc(100vw-32px)] max-w-[430px] border border-white/[0.09] bg-[#1a1a2a] shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-[18px] pb-[14px]">
          <div>
            <h2 className="text-[15px] font-semibold text-[#e8e8f0] mb-0.5">
              Add to vault
            </h2>
            <p className="text-[12px] text-white/30 truncate max-w-[200px] sm:max-w-[320px]">
              {file?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/35 hover:text-white/70 transition mt-0.5"
          >
            <X size={15} />
          </button>
        </div>

        <div className="h-px bg-white/[0.07]" />

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-5">
          {/* Folder name */}
          <div>
            <label className="block text-[12px] text-white/45 mb-2">
              Vault name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                setError(false);
              }}
              placeholder="e.g. Client Projects"
              className={`w-full bg-transparent rounded-xl px-3.5 py-[11px] text-[13px] text-[#e8e8f0] outline-none border transition
                ${
                  error
                    ? "border-red-500"
                    : "border-violet-600 focus:border-violet-400"
                }`}
            />
            {error && (
              <p className="text-[11px] text-red-400 mt-1.5">
                Please enter a vault name.
              </p>
            )}
          </div>

          {/* Color swatches */}
          <div>
            <label className="block text-[12px] text-white/45 mb-2.5">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="w-[38px] h-[38px] rounded-xl flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: color,
                      outline: isSelected
                        ? `2px solid ${color}`
                        : "2px solid transparent",
                      outlineOffset: "2px",
                    }}
                  >
                    {isSelected && <Check size={15} className="text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-5 pb-5">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl bg-[#222236] hover:bg-[#2a2a44] text-white/70 text-[13px] font-medium transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 py-3 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 hover:opacity-90 text-white text-[13px] font-semibold transition-opacity"
          >
            {creating ? "Creating..." : "Create & add"}
          </button>
        </div>
      </div>
    </div>
  );
}
