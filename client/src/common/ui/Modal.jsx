function Modal({ isOpen, onClose, children, maxWidth = "max-w-lg", title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default Modal;
