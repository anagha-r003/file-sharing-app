import { SHARE_STATUS } from "./AnalyticsData";

const STATUS_CONFIG = [
  { key: "active", label: "Active", color: "#10b981" },
  { key: "expired", label: "Expired", color: "#6b7280" },
  { key: "revoked", label: "Revoked", color: "#ef4444" },
];

export default function ShareStatusCard() {
  const { active, expired, revoked } = SHARE_STATUS;
  const total = active + expired + revoked;
  const r = 52,
    cx = 70,
    cy = 70,
    strokeW = 14;
  const circ = 2 * Math.PI * r;
  const aLen = circ * (active / total);
  const eLen = circ * (expired / total);

  return (
    <div className="bg-[#13131f] border border-white/5 rounded-2xl p-5">
      <div className="mb-5">
        <h3 className="text-[15px] font-medium text-white">Share Status</h3>
        <p className="text-xs text-slate-500 mt-0.5">{total} total links</p>
      </div>

      <div className="flex items-center gap-8">
        {/* Donut */}
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          className="flex-shrink-0"
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#1e1e30"
            strokeWidth={strokeW}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#10b981"
            strokeWidth={strokeW}
            strokeDasharray={`${aLen} ${circ - aLen}`}
            strokeDashoffset={circ * 0.25}
            strokeLinecap="round"
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#ef9f27"
            strokeWidth={strokeW}
            strokeDasharray={`${eLen} ${circ - eLen}`}
            strokeDashoffset={circ * 0.25 - aLen}
            strokeLinecap="round"
          />
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fontSize="22"
            fontWeight="500"
            fill="#fff"
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            fontSize="10"
            fill="#64748b"
          >
            total links
          </text>
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {STATUS_CONFIG.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: color }}
              />
              <span className="text-sm text-slate-400 w-14">{label}</span>
              <span className="text-sm font-medium text-white ml-auto">
                {SHARE_STATUS[key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
