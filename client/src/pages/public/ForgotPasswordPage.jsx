import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";
import { forgotPassword } from "../../services/authService";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_#1a1a1a_0%,_#0e0e0e_100%)] text-white">
      {/* Background grid — matches login */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(152,169,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(152,169,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Card — matches login exactly */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-xl bg-[#1a1a1a]/60 backdrop-blur-2xl border border-white/5">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#131313] rounded-xl border border-white/10 mb-6">
            <Shield size={26} className="text-[#98a9ff]" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
            Forgot Password
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
            Recover Access
          </p>
        </div>

        {!sent ? (
          <>
            <p className="text-center text-sm text-gray-400 leading-relaxed mb-7">
              Enter your email and we'll generate a secure link to reset your
              password.
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-[#131313] rounded-xl text-white py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm font-medium">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-br from-[#98a9ff] to-[#4065ff] text-white font-extrabold text-lg rounded-xl hover:shadow-[0_0_25px_rgba(152,169,255,0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 py-2">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle size={28} className="text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-white mb-1">
                Check your inbox
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                We've sent a password reset link to{" "}
                <span className="text-[#98a9ff] font-medium">{email}</span>. It
                expires in 15 minutes.
              </p>
            </div>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-sm text-[#98a9ff] hover:underline transition-colors"
            >
              Didn't receive it? Send again
            </button>
          </div>
        )}

        <div className="mt-10 text-center pt-6 border-t border-zinc-700/30">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-cyan-400 text-sm hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
