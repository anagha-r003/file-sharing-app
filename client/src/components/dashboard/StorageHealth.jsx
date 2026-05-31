import { useState, useEffect } from "react";
import { getStorageStats } from "../../services/dashboardService";
//const TOTAL_GB = 1;

// const CATEGORIES = [
//   { label: "Images", gb: 0.43, color: "#8b5cf6" }, // ~430 MB
//   { label: "Videos", gb: 0.25, color: "#10b981" }, // ~250 MB
//   { label: "Documents", gb: 0.1, color: "#f59e0b" }, // ~100 MB
//   { label: "Others", gb: 0.1, color: "#3B82F6" }, // ~100 MB
// ];

// const usedGB = CATEGORIES.reduce((sum, cat) => sum + cat.gb, 0); // 0.78
// const freeGB = +(TOTAL_GB - usedGB).toFixed(2); // 0.22
// const usedPct = +((usedGB / TOTAL_GB) * 100).toFixed(1); // 78.0%

// Helper: format display — shows exact value from backend
function fmt(mb) {
  if (mb < 1 && mb > 0) return `${mb.toFixed(2)} MB`; // 0.35 → "0.35 MB"
  return `${Math.round(mb)} MB`;
}

// Helper: convert MB to GB string — for total and free display
function fmtGB(mb) {
  return `${(mb / 1024).toFixed(2)} GB`;
}

// ─── Donut helpers ────────────────────────────────────────────────────────────
const CX = 60,
  CY = 60,
  RADIUS = 46,
  STROKE_WIDTH = 9;
const GAP_DEGREES = 3;

function getPoint(angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + RADIUS * Math.cos(rad), y: CY + RADIUS * Math.sin(rad) };
}

function arcPath(startDeg, endDeg) {
  const start = getPoint(startDeg);
  const end = getPoint(endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function buildArcs(categories, totalMB) {
  let cursor = 0;
  return categories.map((cat, index) => {
    const span = (cat.mb / totalMB) * 360; // ← mb not gb
    const isFirst = index === 0;
    const isLast = index === categories.length - 1;
    const startDeg = cursor + (isFirst ? 0 : GAP_DEGREES / 2);
    const endDeg = cursor + span - (isLast ? 0 : GAP_DEGREES / 2);
    cursor += span;
    return { ...cat, startDeg, endDeg };
  });
}

//const ARCS = buildArcs();

// ─── Component ────────────────────────────────────────────────────────────────
export default function StorageHealth({ refreshKey }) {
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        setLoading(true); // step A: start loading

        const result = await getStorageStats(); // step B: call your service
        setStorageData(result); // step C: store the nested data
      } catch (err) {
        console.log("Storage error:", err);
        setError(err.message); // step D: if anything fails, store the error
      } finally {
        setLoading(false); // step E: always stop loading, success or fail
      }
    };

    fetchStorage();
  }, [refreshKey]); // ← include refreshKey in dependency array

  // Still waiting for API response
  if (loading) {
    return (
      <div className="bg-[#0f0f17] border border-[#1a1a28] rounded-[14px] p-6 flex items-center justify-center h-[400px]">
        <span className="text-[#44446a] text-sm animate-pulse">
          Loading storage...
        </span>
      </div>
    );
  }

  // API call failed
  if (error || !storageData) {
    return (
      <div className="bg-[#0f0f17] border border-[#1a1a28] rounded-[14px] p-6 flex items-center justify-center h-[400px]">
        <span className="text-red-400 text-sm">
          Failed to load storage data
        </span>
      </div>
    );
  }

  const CATEGORIES = [
    { label: "Images", mb: storageData.imagesMB, color: "#8b5cf6" },
    { label: "Videos", mb: storageData.videosMB, color: "#10b981" },
    { label: "Documents", mb: storageData.documentsMB, color: "#f59e0b" },
    { label: "Others", mb: storageData.othersMB, color: "#3B82F6" },
  ];

  const totalMB = storageData.storageLimitMB; // 1024
  const usedMB = storageData.totalUsedMB; // 0.35
  const freeMB = storageData.remainingMB; // 1023.65
  const usedPct = storageData.percentage; // 0
  const freePct = storageData.remainingPercentage; // 99

  const activeCategories = CATEGORIES.filter((cat) => cat.mb > 0);
  const ARCS =
    activeCategories.length > 0 ? buildArcs(activeCategories, totalMB) : [];

  return (
    <div className="bg-[#0f0f17] border border-[#1a1a28] rounded-[14px] p-6 hover:border-violet-500/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-[15px] font-bold text-white"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Storage Health
        </h3>
      </div>

      {/* Donut chart */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative" style={{ width: 170, height: 170 }}>
          <svg viewBox="0 0 120 120" width="170" height="170">
            {/* Grey track */}
            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke="#1a1a28"
              strokeWidth={STROKE_WIDTH}
            />
            {/* Coloured arcs */}
            {ARCS.map((arc) => (
              <path
                key={arc.label}
                d={arcPath(arc.startDeg, arc.endDeg)}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Centre label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-[28px] font-black text-white leading-none"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {usedPct}%
            </span>
            <span className="text-[9px] font-semibold text-[#44446a] uppercase tracking-[1.3px] mt-1">
              Allocated
            </span>
          </div>
        </div>

        {/* Used / total — show exact MB used, total in GB */}
        <p className="text-[13px] text-[#44446a] mt-3">
          <span
            className="text-[16px] font-black text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {fmt(usedMB)}
          </span>{" "}
          / {fmtGB(totalMB)} used
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#1a1a28] mb-5" />

      {/* Category legend */}
      <div className="flex flex-col gap-3.5 mb-5">
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="flex items-center gap-3">
            {/* Colour dot */}
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                background: cat.color,
                boxShadow: `0 0 5px ${cat.color}55`,
              }}
            />
            {/* Name */}
            <span className="text-[13px] text-[#8888aa] flex-1">
              {cat.label}
            </span>
            {/* Mini bar */}
            <div
              className="rounded-full overflow-hidden"
              style={{ width: 60, height: 3, background: "#1a1a28" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: usedMB > 0 ? `${(cat.mb / usedMB) * 100}%` : "0%",
                  background: cat.color,
                }}
              />
            </div>
            {/* Size — exact MB value from backend */}
            <span
              className="text-[13px] font-semibold text-white tabular-nums"
              style={{ width: 54, textAlign: "right" }}
            >
              {fmt(cat.mb)}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#1a1a28] mb-5" />

      {/* Remaining available */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10.5px] font-semibold text-[#44446a] uppercase tracking-[0.9px] mb-1.5">
            Remaining Available
          </p>
          {/* Free shown in GB — direct conversion from backend remainingMB */}
          <p
            className="text-[26px] font-black leading-none"
            style={{
              fontFamily: "'Syne', sans-serif",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {fmtGB(freeMB)} <span style={{ fontSize: 13 }}>free</span>
          </p>
        </div>

        {/* 10-bar indicator */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-end gap-[3px]" style={{ height: 28 }}>
            {Array.from({ length: 10 }).map((_, i) => {
              const freeBars = Math.round((freeMB / totalMB) * 10);
              return (
                <div
                  key={i}
                  className="w-1.5 rounded-full"
                  style={{
                    height: 8 + i * 2,
                    background: i < freeBars ? "#6366f1" : "#1a1a28",
                  }}
                />
              );
            })}
          </div>
          {/* freePct comes directly from backend remainingPercentage */}
          <span className="text-[10px] text-[#44446a]">{freePct}% free</span>
        </div>
      </div>
    </div>
  );
}
