import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function ActionMenu({ items = [], align = "right", onOpenChange }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Keep isDesktop in sync on resize — uses matchMedia, no resize spam
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Notify parent of open state
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  const handleOpen = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();

      // Estimate menu height: ~44px per item + 12px padding
      const estimatedMenuHeight = items.length * 44 + 12;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Flip upward if not enough space below but enough above
      const top =
        spaceBelow >= estimatedMenuHeight || spaceBelow >= spaceAbove
          ? rect.bottom + 8 // open downward (default)
          : rect.top - estimatedMenuHeight - 8; // flip upward

      setMenuPos({
        top,
        left: align === "right" ? rect.right - 180 : rect.left,
      });
    }
    setOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on scroll so dropdown doesn't drift from its button
  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  const close = () => setOpen(false);

  // ── Bottom sheet — phones + tablets (< 1024px) ────────────────────────────
  const BottomSheet = () =>
    createPortal(
      <>
        <div
          className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
          onClick={close}
        />
        <div
          ref={menuRef}
          className="fixed bottom-0 left-0 right-0 z-[1000] rounded-t-2xl bg-[#0f1117] border-t border-white/10 shadow-2xl"
          style={{ animation: "slideUp 0.22s cubic-bezier(0.32,0.72,0,1)" }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <div className="px-3 pb-8 pt-2 space-y-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick?.();
                  close();
                }}
                className={`
                  w-full flex items-center gap-4 px-4 py-4 rounded-xl
                  text-[15px] font-medium transition-all
                  ${
                    item.danger
                      ? "text-red-400 hover:bg-red-500/10 active:bg-red-500/20"
                      : "text-slate-200 hover:bg-white/[0.06] active:bg-white/10"
                  }
                `}
              >
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.danger ? "bg-red-500/10" : "bg-white/[0.06]"}`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${item.danger ? "text-red-400" : "text-slate-400"}`}
                  >
                    {item.icon}
                  </span>
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
        `}</style>
      </>,
      document.body,
    );

  // ── Dropdown — desktops (>= 1024px) — flips up when near bottom ──────────
  const Dropdown = () =>
    createPortal(
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: menuPos.top,
          left: menuPos.left,
          zIndex: 1000,
          minWidth: 180,
        }}
        className="
          rounded-2xl border border-white/[0.08]
          bg-[#0f1117]/95 backdrop-blur-xl
          shadow-[0_8px_32px_rgba(0,0,0,0.5)]
          py-1.5 overflow-hidden
        "
      >
        {items.map((item, index) => {
          const prevIsDanger = index > 0 && items[index - 1].danger;
          return (
            <div key={index}>
              {item.danger && !prevIsDanger && index !== 0 && (
                <div className="my-1 mx-3 border-t border-white/[0.06]" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick?.();
                  close();
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5
                  text-[13px] font-medium transition-all
                  ${
                    item.danger
                      ? "text-red-400 hover:bg-red-500/10"
                      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                  }
                `}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.danger ? "bg-red-500/10" : "bg-white/[0.05]"}`}
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${item.danger ? "text-red-400" : "text-slate-400"}`}
                  >
                    {item.icon}
                  </span>
                </span>
                <span>{item.label}</span>
              </button>
            </div>
          );
        })}
      </div>,
      document.body,
    );

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className={`
  w-8 h-8 flex items-center justify-center rounded-full transition-all
  border border-white/5
  ${
    open
      ? "bg-white/[0.10] text-white"
      : "bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.09]"
  }
`}
      >
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>

      {open && (isDesktop ? <Dropdown /> : <BottomSheet />)}
    </div>
  );
}

export default ActionMenu;
