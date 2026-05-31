import { LockIcon } from "lucide-react";

/**
 * TopBar
 * Props:
 *   expiryDate  {string}  – e.g. "May 15, 2026"
 *   isActive    {boolean} – controls the ACTIVE badge
 */
export default function TopBar({
  expiryDate = "May 15, 2026",
  isActive = true,
}) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-8 h-16"
      style={{
        background: "rgba(13,13,20,0.85)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Logo icon */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1L12 4V10L7 13L2 10V4L7 1Z"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="7" cy="7" r="2" fill="white" />
          </svg>
        </div>

        {/* Title */}
        <span className="font-bold text-lg tracking-tight text-white">
          VaultLink
        </span>
      </div>

      {/* Right side */}
      <div
        className="flex items-center gap-3 mono text-xs"
        style={{ color: "#7b7a99" }}
      >
        {isActive && (
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-emerald-400 mono text-xs tracking-widest"
            style={{
              background: "rgba(34,211,160,0.1)",
              border: "1px solid rgba(34,211,160,0.25)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot"
              style={{ boxShadow: "0 0 6px #22d3a0" }}
            />
            ACTIVE LINK
          </span>
        )}
        <span className="hidden sm:block">Expires {expiryDate}</span>
      </div>
    </header>
  );
}
