function GeneratedLinkDisplay({ link, copied, onCopy }) {
  if (!link) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-violet-600/5 border border-violet-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
      <input
        readOnly
        value={link}
        className="flex-1 bg-transparent text-violet-200 text-xs px-2 outline-none truncate"
      />
      <button
        onClick={onCopy}
        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export default GeneratedLinkDisplay;