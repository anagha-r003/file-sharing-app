import Toast from "../../sharedlink/Toast";

function ShareModalActions({
  emails,
  isSending,
  onClose,
  onSend,
  toast,
}) {
  return (
    <>
      <div className="flex items-center justify-end pt-4 border-t border-white/5">

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={emails.length === 0 || isSending }
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition shadow-lg shadow-violet-600/20 disabled:opacity-30 disabled:grayscale"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>

        <Toast
          message={toast.message}
          visible={toast.visible}
          type={toast.type}
        />
      </div>
    </>
  );
}

export default ShareModalActions;
