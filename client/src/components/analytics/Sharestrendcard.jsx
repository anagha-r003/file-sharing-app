import { useState } from "react";
import { LineChart } from "./Charts";
import { SHARES_TREND } from "./AnalyticsData";

const TABS = ["weekly", "monthly"];

const SUBTITLES = {
  weekly: "This week",
  monthly: "This month",
};

export default function SharesTrendCard() {
  const [period, setPeriod] = useState("monthly");

  const { data, labels } = SHARES_TREND[period];

  return (
    <div className="bg-[#13131f] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[15px] font-medium text-white">Shares Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">{SUBTITLES[period]}</p>
        </div>

        {/* Toggle */}
        <div className="flex gap-1 bg-[#0d0d1a] rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setPeriod(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 capitalize
                ${
                  period === tab
                    ? "bg-violet-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <LineChart data={data} labels={labels} color="#a78bfa" />
    </div>
  );
}
