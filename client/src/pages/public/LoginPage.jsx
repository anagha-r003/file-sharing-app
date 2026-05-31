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
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_#1a1a1a_0%,_#0e0e0e_100%)] text-white">
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(152,169,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(152,169,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 w-full max-w-md p-8 rounded-xl bg-[#1a1a1a]/60 backdrop-blur-2xl border border-white/5">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#131313] rounded-xl border border-white/10 mb-6">
            <span className="text-[#98a9ff] text-3xl">🔐</span>
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
            <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
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
            <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
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
                className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 pr-12 outline-none focus:ring-1 focus:ring-cyan-400"
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
                className="text-xs text-cyan-400 hover:text-[#98a9ff] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {errors.general && (
            <p className="text-red-400 text-sm font-medium">{errors.general}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-br from-[#98a9ff] to-[#4065ff] text-white font-extrabold text-lg rounded-xl hover:shadow-[0_0_25px_rgba(152,169,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Secure Login"}
          </button>
        </form>

        <div className="mt-10 text-center pt-6 border-t border-zinc-700/30">
          <p className="text-gray-400 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-cyan-400 font-bold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
