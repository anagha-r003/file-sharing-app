const ACTIVITY = [
  {
    id: 1,
    icon: "cloud_upload",
    color: "#6366f1",
    label: "System_Architecture.fig uploaded",
    sub: "by Alex · 14:20 PM",
    type: "upload",
  },
  {
    id: 2,
    icon: "share",
    color: "#10b981",
    label: "Q3_Marketing_Strategy.pdf shared",
    sub: "with Global Marketing Team · 11:05 AM",
    type: "share",
  },
  {
    id: 3,
    icon: "download",
    color: "#06b6d4",
    label: "Invoices_Pack_July.zip downloaded",
    sub: "via secure link · 09:45 AM",
    type: "access",
  },
  {
    id: 4,
    icon: "person_add",
    color: "#f59e0b",
    label: "New recipient accessed Brand_Guidelines",
    sub: "sarah@partner.co · 09:12 AM",
    type: "access",
  },
  {
    id: 5,
    icon: "cloud_upload",
    color: "#6366f1",
    label: "Product_Roadmap_2025.xlsx uploaded",
    sub: "by Alex · Yesterday 17:30",
    type: "upload",
  },
  {
    id: 6,
    icon: "share",
    color: "#10b981",
    label: "API_Docs_Draft.md share link created",
    sub: "expires in 7 days · Yesterday 14:00",
    type: "share",
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-[#0f0f17] border border-[#1a1a28] rounded-[14px]  hover:border-violet-500/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1a1a28]">
        <h3
          className="text-[15px] font-bold text-white"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Recent Activity
        </h3>
      </div>

      {/* Items */}
      {ACTIVITY.map((a, i) => (
        <div
          key={a.id}
          className={`flex items-start gap-3 px-5 py-3.5 hover:bg-[#14141e] transition-colors ${
            i < ACTIVITY.length - 1 ? "border-b border-[#1a1a28]" : ""
          }`}
        >
          {/* Icon */}
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: a.color + "1a" }}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ color: a.color }}
            >
              {a.icon}
            </span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate">
              {a.label}
            </p>
            <p className="text-[11px] text-[#4a4a6a] mt-0.5">{a.sub}</p>
          </div>

          {/* Badge */}
          <span
            className="text-[10px] font-bold uppercase tracking-[1px] px-2 py-1 rounded-full flex-shrink-0"
            style={{ color: a.color, background: a.color + "1a" }}
          >
            {a.type}
          </span>
        </div>
      ))}
    </div>
  );
}
