import { useState, useEffect } from "react";
import { getRecentActivity } from "../../services/dashboardService";

const ACTION_META = {
  UPLOAD: { icon: "cloud_upload", color: "#6366f1", type: "upload" },
  SHARE: { icon: "share", color: "#10b981", type: "share" },
  DOWNLOAD: { icon: "download", color: "#06b6d4", type: "download" },
  ACCESS: { icon: "person_add", color: "#f59e0b", type: "access" },
};

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;
  return (
    date.toLocaleDateString([], { month: "short", day: "numeric" }) + ` ${time}`
  );
}

export default function RecentActivity({ refreshKey }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRecentActivity()
      .then(setActivity)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="bg-[#0f0f17] border border-[#1a1a28] rounded-[14px] hover:border-violet-500/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1a1a28]">
        <h3
          className="text-[15px] font-bold text-white"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Recent Activity
        </h3>
      </div>

      {/* Loading */}
      {loading && (
        <div className="px-5 py-10 text-center text-[#44446a] text-sm animate-pulse">
          Loading activity...
        </div>
      )}

      {/* Empty */}
      {!loading && activity.length === 0 && (
        <div className="px-5 py-10 text-center text-[#44446a] text-sm">
          No recent activity yet.
        </div>
      )}

      {/* Items */}
      {!loading &&
        activity.map((a, i) => {
          const meta = ACTION_META[a.action] || ACTION_META.UPLOAD;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 px-5 py-3.5 hover:bg-[#14141e] transition-colors ${
                i < activity.length - 1 ? "border-b border-[#1a1a28]" : ""
              }`}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: meta.color + "1a" }}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ color: meta.color }}
                >
                  {meta.icon}
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white truncate">
                  {a.fileName}{" "}
                  <span className="text-[#4a4a6a] font-normal">
                    {a.action.toLowerCase()}
                    {a.action === "UPLOAD"
                      ? "ed"
                      : a.action === "ACCESS"
                        ? "ed"
                        : "d"}
                  </span>
                </p>
                <p className="text-[11px] text-[#4a4a6a] mt-0.5">
                  {a.detail} · {formatTime(a.createdAt)}
                </p>
              </div>

              {/* Badge */}
              <span
                className="text-[10px] font-bold uppercase tracking-[1px] px-2 py-1 rounded-full flex-shrink-0"
                style={{ color: meta.color, background: meta.color + "1a" }}
              >
                {meta.type}
              </span>
            </div>
          );
        })}
    </div>
  );
}
