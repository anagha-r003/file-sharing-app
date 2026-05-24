import { PEAK_HOURS } from "./AnalyticsData";

const TIME_LABELS = ["00:00", "06:00", "12:00", "18:00", "23:00"];

export default function PeakHoursCard() {
  const max = Math.max(...PEAK_HOURS, 1);

  return (
    <div className="bg-[#13131f] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-medium text-white">
            Peak Access Hours
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Activity intensity by hour
          </p>
        </div>
        <span className="material-symbols-outlined text-slate-500 text-xl">
          schedule
        </span>
      </div>

      {/* Heatmap */}
      <div className="flex gap-1">
        {PEAK_HOURS.map((v, i) => {
          const intensity = v / max;
          const bg =
            intensity === 0
              ? "#1a1a2e"
              : `rgba(52,211,153,${0.15 + intensity * 0.85})`;
          return (
            <div
              key={i}
              className="flex-1 h-12 rounded flex items-end justify-center pb-1"
              style={{ background: bg, transition: "background 0.3s" }}
              title={`${String(i).padStart(2, "0")}:00 — ${v} actions`}
            >
              {v > 0 && (
                <span className="text-[9px] text-white/70 font-medium">
                  {v}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Time axis */}
      <div className="flex justify-between mt-1.5">
        {TIME_LABELS.map((t) => (
          <span key={t} className="text-[10px] text-slate-500">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
