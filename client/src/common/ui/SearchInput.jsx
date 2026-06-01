function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#111] border border-white/10 rounded-xl text-white text-sm py-2.5 pl-10 pr-4 outline-none focus:border-violet-500/50 transition placeholder:text-slate-600 shadow-inner"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      )}
    </div>
  );
}

export default SearchInput;
