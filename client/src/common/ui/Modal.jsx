function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-lg",
  title,
  subtitle,
  panelClassName = "",
  headerClassName = "",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative z-10 w-full ${maxWidth} bg-[#0f0f17] border border-[#1a1a28] rounded-[14px] shadow-2xl shadow-black/40 overflow-hidden ${panelClassName}`}
      >
        {title && (
          <div
            className={`flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-[#1a1a28] ${headerClassName}`}
          >
            <div className="min-w-0">
              <h2
                className="text-[15px] font-bold text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-[12px] text-[#44446a] mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[#44446a] hover:text-white transition p-1.5 rounded-lg hover:bg-white/5 shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default Modal;
