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
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-y-auto bg-[#0a0a14] text-white">
      {/* Background radial glow — matches login exactly */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(109,40,217,0.25) 0%, rgba(79,48,160,0.1) 40%, transparent 70%)",
        }}
      />
      {/* Background grid — matches login */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Card — matches login exactly */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-xl bg-[#111118]/60 backdrop-blur-2xl border border-white/5">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#16161f] rounded-xl border border-violet-500/20 mb-6">
            <Shield size={26} className="text-violet-400" />
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
                <label className="block text-xs font-bold text-violet-400 uppercase tracking-wider">
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
                    className="w-full bg-[#16161f] rounded-xl text-white py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-violet-500 border border-white/5"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm font-medium">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 text-white font-extrabold text-lg rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                  boxShadow: "0 0 0 rgba(139,92,246,0)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 25px rgba(139,92,246,0.4)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = "0 0 0 rgba(139,92,246,0)")
                }
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
                <span className="text-violet-400 font-medium">{email}</span>. It
                expires in 15 minutes.
              </p>
            </div>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-sm text-violet-400 hover:underline transition-colors"
            >
              Didn't receive it? Send again
            </button>
          </div>
        )}

        <div className="mt-10 text-center pt-6 border-t border-white/5">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-violet-400 text-sm hover:text-white transition-colors"
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
