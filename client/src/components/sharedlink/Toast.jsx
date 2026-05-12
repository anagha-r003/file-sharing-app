import { CheckIcon } from "lucide-react";

/**
 * Toast
 * Props:
 *   message {string}  – text to display
 *   visible {boolean} – controls show/hide animation
 */
export default function Toast({ message = "", visible = false }) {
  return (
    <div
      className="fixed bottom-8 left-1/2 flex items-center gap-2 px-5 py-3 rounded-xl text-emerald-400 text-xs font-mono z-50 pointer-events-none"
      style={{
        transform: `translateX(-50%) translateY(${visible ? "0" : "16px"})`,
        opacity: visible ? 1 : 0,
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        background: "rgba(26,26,46,0.95)",
        border: "1px solid rgba(34,211,160,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <CheckIcon />
      <span>{message}</span>
    </div>
  );
}
