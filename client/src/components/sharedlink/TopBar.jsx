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
      <div
        className="flex items-center gap-2 font-extrabold text-lg tracking-tight"
        style={{ color: "#c084fc" }}
      >
        <LockIcon />
        VaultLink
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
