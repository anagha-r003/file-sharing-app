function AccessSettings({ access, onAccessChange, expiryDate, onExpiryDateChange }) {
  return (
    <div className="space-y-3">
      <h3 className="text-white font-medium text-sm">General access</h3>
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${access === "anyone" ? "bg-green-500/10" : "bg-slate-700/30"}`}
          >
            <span
              className={`material-symbols-outlined text-xl ${access === "anyone" ? "text-green-500" : "text-slate-400"}`}
            >
              {access === "anyone" ? "public" : "lock"}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <select
                value={access}
                onChange={onAccessChange}
                className="bg-transparent text-white text-sm font-semibold outline-none cursor-pointer appearance-none pr-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJ3aGl0ZSI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0xOSA5bC03IDctNy03Ii8+PC9zdmc+')] bg-[length:14px] bg-[right_center] bg-no-repeat"
              >
                <option value="anyone" className="bg-[#1e1e1e]">
                  Anyone with the link
                </option>
                <option value="restricted" className="bg-[#1e1e1e]">
                  Restricted
                </option>
              </select>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {access === "anyone"
                ? "Anyone with link can view"
                : "Only invited people"}
            </p>
          </div>
        </div>

        {/* RIGHT POSITIONED EXPIRY */}
        <div className="flex flex-col items-end gap-1.5 border-l border-white/10 pl-4">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            <span className="material-symbols-outlined text-[14px]">
              timer
            </span>
            Expiry
          </div>
          <input
            type="datetime-local"
            value={expiryDate}
            onChange={onExpiryDateChange}
            className="bg-[#111] border border-white/10 rounded-lg text-slate-300 text-[11px] px-2 py-1.5 outline-none focus:border-violet-500/50 transition [color-scheme:dark]"
          />
        </div>
      </div>
    </div>
  );
}

export default AccessSettings;