import Toast from "../../sharedlink/Toast";

function ShareModalActions({
  link,
  emails,
  loading,
  onGenerateLink,
  onClose,
  onSend,
  toast,
}) {
  return (
    <>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <button
          onClick={onGenerateLink}
          disabled={loading}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">link</span>
          {loading ? "Generating..." : link ? "Update Link" : "Create Link"}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={emails.length === 0}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition shadow-lg shadow-violet-600/20 disabled:opacity-30 disabled:grayscale"
          >
            Send
          </button>
        </div>

        <Toast message={toast.message} visible={toast.visible} />
      </div>
    </>
  );
}

export default ShareModalActions;