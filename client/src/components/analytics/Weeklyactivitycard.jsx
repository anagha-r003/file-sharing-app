import { BarChart } from "./Charts";
import { WEEKLY_ACTIVITY } from "./AnalyticsData";

export default function WeeklyActivityCard() {
  return (
    <div className="bg-[#13131f] border border-white/5 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-medium text-white">
            Weekly Activity
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Uploads vs downloads</p>
        </div>
        <div className="flex gap-4">
          {[
            ["#a78bfa", "Uploads"],
            ["#60a5fa", "Downloads"],
          ].map(([color, label]) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs text-slate-400"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              {label}
            </div>
          ))}
        </div>
      </div>
      <BarChart
        uploads={WEEKLY_ACTIVITY.uploads}
        downloads={WEEKLY_ACTIVITY.downloads}
        labels={WEEKLY_ACTIVITY.labels}
      />
    </div>
  );
}
