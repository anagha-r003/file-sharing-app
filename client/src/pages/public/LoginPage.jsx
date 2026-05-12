import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(formData);

      // Debug: log response to see exact field names from your backend
      console.log("Login response:", response);

      // Adjust these field names to match your backend's actual response
      const { accessToken, refreshToken } = response.data;
      const user = {
        name: response.data.firstName,
        email: response.data.email,
      };

      if (!accessToken) {
        setError("Login failed: no token received. Check backend response.");
        return;
      }

      // Save to context (which also saves to localStorage)
      login(user, accessToken, refreshToken);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.message || "Invalid email or password";
      setError(message);
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
              required
              className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
            />
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
                required
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
          </div>

          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

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
