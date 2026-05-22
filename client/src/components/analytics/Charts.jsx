/* ─── BarChart ──────────────────────────────────────────────────────────── */
export function BarChart({ uploads, downloads, labels }) {
  const max = Math.max(...uploads, ...downloads, 1);
  return (
    <div className="flex items-end gap-2 h-44 px-1">
      {labels.map((label, i) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1 h-full">
          <div className="flex-1 flex items-end gap-0.5 w-full">
            <div
              className="flex-1 rounded-t"
              style={{
                background: "linear-gradient(180deg,#a78bfa,#7c5fe6)",
                height: `${(uploads[i] / max) * 100}%`,
                minHeight: uploads[i] ? 4 : 0,
                transition: "height 0.5s ease",
              }}
            />
            <div
              className="flex-1 rounded-t"
              style={{
                background: "linear-gradient(180deg,#60a5fa,#3b82f6)",
                height: `${(downloads[i] / max) * 100}%`,
                minHeight: downloads[i] ? 4 : 0,
                transition: "height 0.5s ease",
              }}
            />
          </div>
          <span className="text-[10px] text-slate-500 tracking-wide">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── LineChart ─────────────────────────────────────────────────────────── */
export function LineChart({ data, labels, color = "#a78bfa" }) {
  const W = 860, H = 140, PAD = 20;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [
    PAD + (i / (data.length - 1)) * (W - PAD * 2),
    H - PAD - (v / max) * (H - PAD * 2),
  ]);
  const linePath  = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaPath  = `${linePath} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={PAD} x2={W - PAD}
          y1={H - PAD - t * (H - PAD * 2)}
          y2={H - PAD - t * (H - PAD * 2)}
          stroke="#1e2035" strokeWidth="1"
        />
      ))}
      <path d={areaPath} fill="url(#lineGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={color} stroke="#13131f" strokeWidth="2" />
      ))}
      {labels.map((l, i) => (
        <text key={l} x={pts[i][0]} y={H} textAnchor="middle" fontSize="10" fill="#64748b">{l}</text>
      ))}
    </svg>
  );
}

/* ─── SharesDayChart ────────────────────────────────────────────────────── */
export function SharesDayChart({ data, labels }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2.5 h-40 px-1">
      {labels.map((label, i) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1 h-full">
          <div className="flex-1 flex items-end w-full">
            <div
              className="w-full rounded-t"
              style={{
                background: "linear-gradient(180deg,#34d399,#10b981)",
                height: `${(data[i] / max) * 100}%`,
                minHeight: data[i] ? 6 : 0,
                transition: "height 0.5s ease",
              }}
            />
          </div>
          <span className="text-[10px] text-slate-500 tracking-wide">{label}</span>
        </div>
      ))}
    </div>
  );
}