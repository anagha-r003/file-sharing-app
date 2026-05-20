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
      <main className="relative min-h-screen flex items-center justify-center px-4 py-10 bg-[radial-gradient(circle_at_top_left,_#1a1a1a_0%,_#0e0e0e_100%)] text-white">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(152,169,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(152,169,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative z-10 w-full max-w-md p-8 rounded-xl bg-[#1a1a1a]/60 backdrop-blur-2xl border border-white/5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#131313] rounded-xl border border-white/10 mb-5">
            <KeyRound size={24} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Invalid Link</h1>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#98a9ff] to-[#4065ff] text-white text-sm font-bold hover:shadow-[0_0_25px_rgba(152,169,255,0.4)] transition-all active:scale-95"
          >
            Request New Link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_#1a1a1a_0%,_#0e0e0e_100%)] text-white">

      {/* Background grid — matches login */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(152,169,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(152,169,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Card — matches login exactly */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-xl bg-[#1a1a1a]/60 backdrop-blur-2xl border border-white/5">

        {!done ? (
          <>
            {/* Icon */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#131313] rounded-xl border border-white/10 mb-6">
                <KeyRound size={24} className="text-[#98a9ff]" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
                Reset Password
              </h1>
              <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
                Secure Your Account
              </p>
            </div>

            <p className="text-center text-sm text-gray-400 leading-relaxed mb-7">
              Create a strong new password for your vault. This link expires in{" "}
              <span className="text-[#98a9ff] font-medium">15 minutes</span>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider mb-2">
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
                    className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 pr-12 outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <PasswordStrength password={formData.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider mb-2">
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
                    className={`w-full bg-[#131313] rounded-xl text-white py-3 px-4 pr-12 outline-none transition-all ${
                      passwordMismatch
                        ? "ring-1 ring-red-500"
                        : passwordsMatch
                          ? "ring-1 ring-[#5dcaa5]"
                          : "focus:ring-1 focus:ring-cyan-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
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
                className="w-full py-4 bg-gradient-to-br from-[#98a9ff] to-[#4065ff] text-white font-extrabold text-lg rounded-xl hover:shadow-[0_0_25px_rgba(152,169,255,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#131313] rounded-xl border border-white/10">
                <ShieldCheck size={26} className="text-[#5dcaa5]" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Password Reset!
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your password has been updated successfully. You can now sign
                in with your new password.
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-4 bg-gradient-to-br from-[#98a9ff] to-[#4065ff] text-white font-extrabold text-lg rounded-xl hover:shadow-[0_0_25px_rgba(152,169,255,0.4)] transition-all active:scale-95"
            >
              Go to Sign In
            </button>
          </div>
        )}

        {/* Back link — hide on success */}
        {!done && (
          <div className="mt-10 text-center pt-6 border-t border-zinc-700/30">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-gray-400 text-sm hover:text-white transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default ResetPasswordPage;