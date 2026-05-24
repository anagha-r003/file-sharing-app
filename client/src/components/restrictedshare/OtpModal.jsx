import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────
   OtpModal
   Props:
     isOpen      : boolean
     onClose     : () => void
     onSubmit    : (otp: string) => void
     onResend    : () => void
     isLoading   : boolean
     isResending : boolean
     email       : string
     error       : string  (from parent, e.g. "Invalid OTP")
───────────────────────────────────────────── */
export function OtpModal({
  isOpen,
  onClose,
  onSend,
  onSubmit,
  onResend,
  isSending,
  isLoading,
  isResending,
  email,
  error: externalError,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setOtpRequested(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && otpRequested) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen, otpRequested]);

  useEffect(() => {
    if (externalError) setError(externalError);
  }, [externalError]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSend = async () => {
    setError("");
    if (!onSend) return;
    const sent = await onSend();
    if (sent) {
      setOtpRequested(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setError("");
    onSubmit(code);
  };

  const maskedEmail = email
    ? email.replace(
        /(.{2})(.*)(@.*)/,
        (_, a, b, c) => a + "*".repeat(b.length) + c,
      )
    : "";

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
              style={{ background: "#0f2d1f" }}
            >
              <span className="material-symbols-outlined text-emerald-400 text-xl">
                verified
              </span>
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-white leading-tight">
                {otpRequested ? "Enter Verification Code" : "Restricted Access"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {otpRequested
                  ? "Check your inbox"
                  : "Verify your identity to continue"}
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

        <div className="text-sm text-slate-400 mb-6 leading-relaxed">
          {otpRequested ? (
            <>
              We sent a 6-digit code to <span className="text-violet-400 font-medium">{maskedEmail}</span>.
              Enter it below to access the file.
            </>
          ) : (
            <>
              <p>OTP will be sent to</p>
              <p className="text-violet-400 font-medium mt-2">{maskedEmail}</p>
            </>
          )}
        </div>

        {/* Form */}
        <form onSubmit={otpRequested ? handleSubmit : undefined}>
          {otpRequested && (
            <>
              <div className="flex gap-2 justify-center mb-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-semibold text-white rounded-xl outline-none transition"
                    style={{
                      background: digit ? "#1e1b3a" : "#0d0d1a",
                      border: `0.5px solid ${
                        error ? "#ef4444" : digit ? "#7c5fe6" : "#2a2a3d"
                      }`,
                      caretColor: "#7c5fe6",
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center mt-4 mb-6">
                <span className="text-xs text-slate-500">Didn't receive it?</span>
                <button
                  type="button"
                  onClick={() => {
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                    onResend();
                  }}
                  disabled={isResending}
                  className="ml-1.5 text-xs text-violet-400 hover:text-violet-300 transition font-medium disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend code"}
                </button>
              </div>
            </>
          )}

          {error && (
            <p className="text-xs text-red-400 text-center mt-2 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition"
              style={{ background: "#1a1a2e", border: "0.5px solid #2a2a3d" }}
            >
              Cancel
            </button>
            <button
              type={otpRequested ? "submit" : "button"}
              onClick={!otpRequested ? handleSend : undefined}
              disabled={otpRequested ? isLoading || otp.join("").length < 6 : isSending}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition flex items-center justify-center gap-2"
              style={{
                background: otpRequested
                  ? otp.join("").length < 6
                    ? "#2a2a3d"
                    : isLoading
                      ? "#4c3a9e"
                      : "#7c5fe6"
                  : isSending
                    ? "#4c3a9e"
                    : "#7c5fe6",
                opacity: otpRequested ? (isLoading ? 0.8 : 1) : isSending ? 0.8 : 1,
              }}
            >
              {otpRequested ? (
                isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    Verify
                  </>
                )
              ) : isSending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  Send OTP
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OtpModal;
