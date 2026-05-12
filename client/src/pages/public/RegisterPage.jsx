import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registerUser } from "../services/authService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
  });

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    digit: /[0-9]/.test(form.password),
    special: /[!@#$%^&*]/.test(form.password),
  };

  const strengthScore = Object.values(passwordChecks).filter(Boolean).length;

  const strengthText =
    strengthScore <= 2 ? "Weak" : strengthScore <= 4 ? "Medium" : "Strong";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let frontendErrors = {};

    // frontend UX validation
    if (form.password !== form.confirmPassword) {
      frontendErrors.confirmPassword = "Passwords do not match";
    }

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        dob: form.dob,
      };

      const response = await registerUser(payload);

      toast.success("Registration successful", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
        className:
          "!bg-[#0e0e0e] !text-white !border !border-emerald-500/30 !rounded-xl !shadow-lg",
      });
      console.log("Success:", response);

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        dob: "",
      });

      setErrors({});
    } catch (error) {
      console.error(error);

      let backendErrors = {};

      if (error.response) {
        const response = error.response.data;

        if (response.data && typeof response.data === "object") {
          backendErrors = response.data;
        } else {
          const message = response.message;

          if (message.toLowerCase().includes("email")) {
            backendErrors.email = message;
          } else if (
            message.toLowerCase().includes("password") ||
            message.toLowerCase().includes("match")
          ) {
            backendErrors.confirmPassword = message;
          } else {
            backendErrors.general = message;
          }
        }
      } else {
        backendErrors.general = "Something went wrong";
      }

      setErrors({
        ...backendErrors,
        ...frontendErrors,
      });
    }

    // If only frontend error exists but backend succeeds
    if (Object.keys(frontendErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        ...frontendErrors,
      }));
    }
  };
  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#0e0e0e]/70 backdrop-blur-xl">
        <div className="text-xl font-bold tracking-tighter text-[#98a9ff]">
          VaultLink
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[#adaaaa] hover:text-white transition-colors cursor-pointer">
            ?
          </span>
          <span className="text-[#adaaaa] hover:text-white transition-colors cursor-pointer">
            i
          </span>
        </div>
      </header>

      {/* Main Section */}
      <main className="relative flex-grow flex items-center justify-center px-4 pt-24 pb-12 overflow-hidden bg-[radial-gradient(circle_at_top_left,_#1a1a1a_0%,_#0e0e0e_100%)]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(152,169,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(152,169,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* Glow Orb */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
          <div className="w-96 h-96 rounded-full bg-[#98a9ff] blur-[120px]"></div>
        </div>

        {/* Glass Card */}
        <div className="relative z-10 w-full max-w-2xl p-8 md:p-12 rounded-xl bg-[#1a1a1a]/60 backdrop-blur-2xl">
          {/* Heading */}
          <div className="mb-12 text-center max-w-lg mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Create Your Vault
            </h1>

            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              Securely store, manage, and share your files from one protected
              workspace.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                placeholder="Alex"
                onChange={handleChange}
                className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
              {errors.firstName && (
                <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                placeholder="Vance"
                onChange={handleChange}
                className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Secure Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="vance@obsidian.network"
                onChange={handleChange}
                className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Vault Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 pr-12 outline-none focus:ring-1 focus:ring-cyan-400"
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Confirm Vault Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 pr-12 outline-none focus:ring-1 focus:ring-cyan-400"
                />

                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {form.password && (
              <div className="px-1 py-1 space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Password Requirements
                </p>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <p
                    className={
                      passwordChecks.length ? "text-green-400" : "text-gray-400"
                    }
                  >
                    • 8+ characters
                  </p>
                  <p
                    className={
                      passwordChecks.uppercase
                        ? "text-green-400"
                        : "text-gray-400"
                    }
                  >
                    • One uppercase
                  </p>
                  <p
                    className={
                      passwordChecks.lowercase
                        ? "text-green-400"
                        : "text-gray-400"
                    }
                  >
                    • One lowercase
                  </p>
                  <p
                    className={
                      passwordChecks.digit ? "text-green-400" : "text-gray-400"
                    }
                  >
                    • One digit
                  </p>
                  <p
                    className={
                      passwordChecks.special
                        ? "text-green-400"
                        : "text-gray-400"
                    }
                  >
                    • One special char
                  </p>
                </div>

                {/* Strength Bar */}
                <div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          strengthScore >= level ? "bg-cyan-400" : "bg-gray-700"
                        }`}
                      ></div>
                    ))}
                  </div>

                  <p className="text-[10px] text-cyan-400 mt-2 uppercase">
                    Strength: {strengthText}
                  </p>
                </div>
              </div>
            )}

            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
              {errors.dob && (
                <p className="text-red-400 text-xs mt-1">{errors.dob}</p>
              )}
            </div>

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-br from-[#98a9ff] to-[#4065ff] text-white font-extrabold text-lg rounded-xl hover:shadow-[0_0_25px_rgba(152,169,255,0.4)] transition-all active:scale-95"
              >
                Join the Vault
              </button>
            </div>
          </form>

          {/* Bottom Info */}
          <div className="mt-10 text-center space-y-4">
            <p className="text-gray-400 text-sm">
              Already have an account?
              <Link
                to="/login"
                className="text-cyan-400 font-bold hover:underline ml-1"
              >
                Secure Login
              </Link>
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6 border-t border-zinc-700/30">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">✔</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  End-to-End Encrypted
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-cyan-400">🔒</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Zero-Trust Protocol
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-black flex flex-col md:flex-row justify-between items-center px-12 gap-4">
        <div className="text-xs tracking-wide text-gray-400 uppercase">
          © 2026 VaultLink. Protected storage. Trusted sharing.
        </div>

        <nav className="flex gap-8">
          <a className="text-xs tracking-wide text-gray-400 uppercase hover:text-cyan-400 transition-all">
            Privacy Policy
          </a>
          <a className="text-xs tracking-wide text-gray-400 uppercase hover:text-cyan-400 transition-all">
            Terms of Service
          </a>
          <a className="text-xs tracking-wide text-gray-400 uppercase hover:text-cyan-400 transition-all">
            Security Architecture
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default RegisterPage;
