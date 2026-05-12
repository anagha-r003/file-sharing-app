function DeleteConfirmModal({ fileName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-[#13151f] border border-white/10 rounded-2xl shadow-2xl p-5 md:p-6 overflow-hidden">
        {/* Subtle red glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Animation */}
        <div className="relative flex justify-center mb-5">
          <div className="relative w-20 h-20">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <span
                className="material-symbols-outlined text-red-400"
                style={{ fontSize: 40 }}
              >
                delete
              </span>
            </div>
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2"
              style={{ animation: "dropIntoBin 1.2s ease-in-out infinite" }}
            >
              <span
                className="material-symbols-outlined text-slate-400"
                style={{ fontSize: 22 }}
              >
                draft
              </span>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes dropIntoBin {
            0%   { transform: translateX(-50%) translateY(0px);  opacity: 1;  }
            60%  { transform: translateX(-50%) translateY(28px); opacity: 0.6; }
            80%  { transform: translateX(-50%) translateY(36px); opacity: 0;  }
            100% { transform: translateX(-50%) translateY(0px);  opacity: 1;  }
          }
        `}</style>

        <h3 className="text-white font-bold text-base md:text-lg text-center mb-1">
          Move to Recycle Bin?
        </h3>
        <p className="text-slate-400 text-sm text-center mb-1">
          <span className="text-white font-medium">"{fileName}"</span>
        </p>
        <p className="text-slate-500 text-xs text-center mb-5 md:mb-6">
          This file will be moved to the recycle bin and can be restored later.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Move to Bin
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;