import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    let frontendErrors = {};

    // Email Validation
    if (!formData.email.trim()) {
      frontendErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      frontendErrors.email = "Enter a valid email address";
    }

    // Password Validation
    if (!formData.password.trim()) {
      frontendErrors.password = "Password is required";
    }

    // STOP API if validation fails
    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await loginUser(payload);

      console.log("Login response:", response);

      login(response.data);

      const params = new URLSearchParams(window.location.search);

      const redirect = params.get("redirect");

      const isShareRedirect = redirect && redirect.startsWith("/public/share/");

      navigate(isShareRedirect ? "/shared-with-me" : redirect || "/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setErrors({
        general: err.response?.data?.message || "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a14] text-white min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="absolute top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-900/40">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1L12 4V10L7 13L2 10V4L7 1Z"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="7" cy="7" r="2" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            VaultLink
          </span>
        </div>
      </header>

      <main className="relative flex-grow flex items-center justify-center px-4 py-10 overflow-y-auto">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(109,40,217,0.25) 0%, rgba(79,48,160,0.1) 40%, transparent 70%)",
            }}
          />
        </div>
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative z-10 w-full max-w-md p-8 rounded-xl bg-[#111118]/60 backdrop-blur-2xl border border-white/5">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#16161f] rounded-xl border border-violet-500/20 mb-6">
              <span className="text-violet-400 text-3xl">🔐</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
              Authorize Access
            </h1>
            <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
              Secure File Vault
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-violet-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#16161f] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-violet-500 border border-white/5"
                onCopy={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-violet-400 uppercase tracking-wider">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full bg-[#16161f] rounded-xl text-white py-3 px-4 pr-12 outline-none focus:ring-1 focus:ring-violet-500 border border-white/5"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {errors.general && (
              <p className="text-red-400 text-sm font-medium">
                {errors.general}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-extrabold text-lg rounded-xl transition-all active:scale-95 disabled:opacity-50"
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
              {loading ? "Logging in..." : "Secure Login"}
            </button>
          </form>

          <div className="mt-10 text-center pt-6 border-t border-white/5">
            <p className="text-gray-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-violet-400 font-bold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
