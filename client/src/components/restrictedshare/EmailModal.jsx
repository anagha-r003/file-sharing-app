import { useState, useRef, useEffect } from "react";

const EmailModal = ({ isOpen, onClose, onSubmit, isLoading, fileName }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    onSubmit(email.trim());
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "#13131f", border: "0.5px solid #2a2a3d" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#1e1b3a" }}
            >
              <span className="material-symbols-outlined text-violet-400 text-xl">
                lock
              </span>
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-white leading-tight">
                Restricted Access
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify your identity to continue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition p-1 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* File info */}
        {fileName && (
          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-5"
            style={{ background: "#0d0d1a", border: "0.5px solid #1e1e30" }}
          >
            <span className="material-symbols-outlined text-violet-400 text-lg">
              description
            </span>
            <span className="text-sm text-slate-300 truncate">{fileName}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-slate-400 mb-5 leading-relaxed">
          This file is protected. Enter your email address and we'll send you a
          one-time code to access it.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Email address
            </label>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition"
              style={{
                background: "#0d0d1a",
                border: `0.5px solid ${error ? "#ef4444" : "#2a2a3d"}`,
              }}
              onFocus={(e) =>
                !error && (e.target.style.border = "0.5px solid #7c5fe6")
              }
              onBlur={(e) =>
                !error && (e.target.style.border = "0.5px solid #2a2a3d")
              }
            />
            {error && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition"
              style={{ background: "#1a1a2e", border: "0.5px solid #2a2a3d" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition flex items-center justify-center gap-2"
              style={{
                background: isLoading ? "#4c3a9e" : "#7c5fe6",
                opacity: isLoading ? 0.8 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    send
                  </span>
                  Send OTP
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailModal;
