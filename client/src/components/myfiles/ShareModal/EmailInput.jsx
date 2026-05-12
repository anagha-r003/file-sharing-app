function EmailInput({ emails, email, onEmailChange, onEmailKeyDown, onRemoveEmail }) {
  return (
    <div className="border border-violet-500/40 rounded-xl px-4 py-3 bg-white/[0.02] focus-within:border-violet-500/80 focus-within:bg-white/[0.04] transition">
      <label className="block text-[10px] uppercase tracking-wider text-violet-400 mb-2 font-bold">
        Add people
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        {emails.map((em) => (
          <span
            key={em}
            className="flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-200 text-xs pl-2.5 pr-1.5 py-1 rounded-lg"
          >
            {em}
            <button
              onClick={() => onRemoveEmail(em)}
              className="hover:bg-violet-500/30 rounded-md transition p-0.5"
            >
              <span className="material-symbols-outlined text-[14px]">
                close
              </span>
            </button>
          </span>
        ))}
        <input
          type="email"
          value={email}
          onChange={onEmailChange}
          onKeyDown={onEmailKeyDown}
          placeholder={
            emails.length === 0 ? "Enter email and press Enter" : ""
          }
          className="flex-1 min-w-[140px] bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
        />
      </div>
    </div>
  );
}

export default EmailInput;