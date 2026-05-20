import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { resetPassword } from "../../services/authService";

function PasswordStrength({ password }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "One number", pass: /[0-9]/.test(password) },
    { label: "One special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const strength = checks.filter((c) => c.pass).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-amber-400",
    "bg-yellow-300",
    "bg-[#5dcaa5]",
  ][strength];
  const strengthText = [
    "",
    "text-red-400",
    "text-amber-400",
    "text-yellow-300",
    "text-[#5dcaa5]",
  ][strength];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= strength ? strengthColor : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-semibold ${strengthText}`}>
          {strengthLabel}
        </span>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                c.pass
                  ? "bg-[#5dcaa5]/20 border border-[#5dcaa5]/50"
                  : "border border-white/10"
              }`}
            >
              {c.pass && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path
                    d="M1.5 4L3 5.5L6.5 2"
                    stroke="#5dcaa5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-[11px] transition-colors ${c.pass ? "text-[#5dcaa5]" : "text-[#55536a]"}`}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const passwordMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  const strengthChecks = [
    formData.password.length >= 8,
    /[A-Z]/.test(formData.password),
    /[0-9]/.test(formData.password),
    /[^A-Za-z0-9]/.test(formData.password),
  ];
  const isStrong = strengthChecks.every(Boolean);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isStrong) {
      setError("Please meet all password requirements.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({
        token,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setDone(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Reset failed. Link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Invalid or missing token
  if (!token) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 py-10 bg-[#09090f] text-white">
        <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(152,130,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(152,130,255,1)_1px,transparent_1px)] bg-[size:36px_36px]" />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="bg-[#111120] border border-white/[0.07] rounded-2xl px-6 py-10 sm:px-10">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
              <KeyRound size={24} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">
              Invalid Link
            </h1>
            <p className="text-sm text-[#8884a8] mb-6 leading-relaxed">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#6c56f5] to-[#9b7ff7] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-y-auto bg-[#09090f] text-white">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(152,130,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(152,130,255,1)_1px,transparent_1px)] bg-[size:36px_36px]" />

      {/* Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(108,86,245,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(155,127,247,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#111120] border border-white/[0.07] rounded-2xl px-6 py-10 sm:px-10 shadow-[0_0_60px_rgba(108,86,245,0.08)]">
          {!done ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6c56f5] to-[#9b7ff7] flex items-center justify-center shadow-[0_0_24px_rgba(108,86,245,0.4)]">
                  <KeyRound size={26} className="text-white" />
                </div>
              </div>

              {/* Heading */}
              <div className="text-center mb-7">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                  Reset Password
                </h1>
                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#6c5fc7]">
                  Secure Your Account
                </p>
              </div>

              <p className="text-center text-sm text-[#8884a8] leading-relaxed mb-7">
                Create a strong new password for your vault. This link expires
                in{" "}
                <span className="text-[#9b7ff7] font-medium">15 minutes</span>.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-[#7c6ef5] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      required
                      className="w-full bg-[#0e0e1a] border border-white/[0.1] rounded-xl px-4 py-3 pr-12 text-sm text-[#d4cfff] placeholder-[#45435a] outline-none focus:border-[#6c56f5]/60 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55536a] hover:text-[#9b7ff7] transition-colors"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <PasswordStrength password={formData.password} />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-[#7c6ef5] mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter new password"
                      required
                      className={`w-full bg-[#0e0e1a] border rounded-xl px-4 py-3 pr-12 text-sm text-[#d4cfff] placeholder-[#45435a] outline-none transition-colors ${
                        passwordMismatch
                          ? "border-red-500/50 focus:border-red-500/70"
                          : passwordsMatch
                            ? "border-[#5dcaa5]/50 focus:border-[#5dcaa5]/70"
                            : "border-white/[0.1] focus:border-[#6c56f5]/60"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55536a] hover:text-[#9b7ff7] transition-colors"
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Match indicator */}
                  {passwordsMatch && (
                    <p className="mt-1.5 text-[11px] text-[#5dcaa5] flex items-center gap-1">
                      <CheckCircle size={12} /> Passwords match
                    </p>
                  )}
                  {passwordMismatch && (
                    <p className="mt-1.5 text-[11px] text-red-400">
                      Passwords do not match
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !isStrong || !passwordsMatch}
                  className="w-full py-4 rounded-xl bg-gradient-to-br from-[#6c56f5] to-[#9b7ff7] text-white font-bold text-[15px] tracking-wide hover:opacity-90 hover:-translate-y-[1px] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center space-y-5 py-2">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-[#1d9e75]/15 border border-[#1d9e75]/30 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-[#5dcaa5]" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-white">
                  Password Reset!
                </h2>
                <p className="text-sm text-[#8884a8] leading-relaxed">
                  Your password has been updated successfully. You can now sign
                  in with your new password.
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-4 rounded-xl bg-gradient-to-br from-[#6c56f5] to-[#9b7ff7] text-white font-bold text-[15px] hover:opacity-90 transition-opacity"
              >
                Go to Sign In
              </button>
            </div>
          )}

          {/* Back link — hide on success */}
          {!done && (
            <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-center">
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm text-[#6c5fc7] hover:text-[#9b7ff7] transition-colors"
              >
                <ArrowLeft size={15} />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default ResetPasswordPage;
