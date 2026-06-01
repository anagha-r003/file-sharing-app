import { HardDrive } from "lucide-react";

export default function StorageManagementCard({ onCleanUpClick }) {
  return (
    <div className="bg-[#0f0f17] border border-[#1a1a28] rounded-[14px] p-5 hover:border-violet-500/50 transition">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#6366f115] border border-[#6366f122] flex items-center justify-center shrink-0">
            <HardDrive size={18} className="text-[#6366f1]" />
          </div>
          <div className="min-w-0">
            <h3
              className="text-[14px] font-bold text-white mb-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Manage Storage
            </h3>
            <p className="text-[12px] text-[#44446a] leading-relaxed">
              Remove large and duplicate files to keep VaultLink optimized.
            </p>
          </div>
        </div>

        <button
          onClick={onCleanUpClick}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          Clean Up Space
        </button>
      </div>
    </div>
  );
}
