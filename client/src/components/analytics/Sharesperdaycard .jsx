import { SharesDayChart } from "./Charts";
import { SHARES_DAY, WEEKLY_ACTIVITY } from "./AnalyticsData";

export default function SharesPerDayCard() {
  return (
    <div className="bg-[#13131f] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-medium text-white">Shares / Day</h3>
          <p className="text-xs text-slate-500 mt-0.5">This week</p>
        </div>
        <span className="material-symbols-outlined text-slate-500 text-xl">
          share
        </span>
      </div>
      <SharesDayChart data={SHARES_DAY} labels={WEEKLY_ACTIVITY.labels} />
    </div>
  );
}
