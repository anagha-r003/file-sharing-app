import { LARGEST_FILES } from "./AnalyticsData";

export default function LargestFilesCard() {
  const maxBytes = Math.max(...LARGEST_FILES.map((f) => f.bytes));

  return (
    <div className="bg-[#13131f] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-medium text-white">Largest Files</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Top {LARGEST_FILES.length} by size
          </p>
        </div>
        <span className="material-symbols-outlined text-slate-500 text-xl">
          monitoring
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {LARGEST_FILES.map((file, i) => (
          <div key={file.name} className="flex items-center gap-3">
            {/* Rank badge */}
            <div className="w-7 h-7 rounded-full bg-[#1e1e30] flex items-center justify-center text-[11px] text-slate-400 font-medium flex-shrink-0">
              {i + 1}
            </div>

            {/* Bar + name */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-slate-200 mb-1.5 truncate">
                {file.name}
              </p>
              <div className="h-1 rounded-full bg-[#1e1e30] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(file.bytes / maxBytes) * 100}%`,
                    background: file.color,
                    minWidth: 8,
                  }}
                />
              </div>
            </div>

            <span className="text-[12px] text-slate-500 flex-shrink-0">
              {file.size}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
