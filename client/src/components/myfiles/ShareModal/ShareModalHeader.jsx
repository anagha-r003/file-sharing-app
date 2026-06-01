function ShareModalHeader({ fileName, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 pt-6 pb-4">
      <div className="flex-1 min-w-0 pr-4">
        <h2 className="text-lg font-semibold text-white">Send the link for</h2>
        <p className="text-violet-400 font-semibold text-base mt-0.5 truncate">
          "{fileName}"
        </p>
        <p className="text-slate-500 text-xs mt-1">
          You'll send an email with the link from below
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}

export default ShareModalHeader;