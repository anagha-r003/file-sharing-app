import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registerUser } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../components/sharedlink/Toast";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [toastState, setToastState] = useState({
    visible: false,
    message: "",
    type: "success",
  });

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

    let frontendErrors = {};

    // First Name Validation
    if (!form.firstName.trim()) {
      frontendErrors.firstName = "First name is required";
    } else if (
      form.firstName.trim().length < 2 ||
      form.firstName.trim().length > 30
    ) {
      frontendErrors.firstName = "First name must be 2 to 30 characters";
    } else if (!/^[A-Za-z_]+$/.test(form.firstName.trim())) {
      frontendErrors.firstName = "Invalid first name";
    }

    // Last Name Validation
    if (!form.lastName.trim()) {
      frontendErrors.lastName = "Last name is required";
    } else if (
      form.lastName.trim().length < 1 ||
      form.lastName.trim().length > 30
    ) {
      frontendErrors.lastName = "Last name must be 1 to 30 characters";
    }

    // Email Validation
    if (!form.email.trim()) {
      frontendErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      frontendErrors.email = "Enter a valid email address";
    }

    // Password Validation
    if (!form.password) {
      frontendErrors.password = "Password is required";
    } else {
      if (form.password.length < 8 || form.password.length > 20) {
        frontendErrors.password = "Password must be 8 to 20 characters";
      } else if (
        !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).*$/.test(form.password)
      ) {
        frontendErrors.password =
          "Password must contain uppercase, lowercase, special character and number";
      }
    }

    // Confirm Password Validation
    if (!form.confirmPassword) {
      frontendErrors.confirmPassword = "Confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      frontendErrors.confirmPassword = "Passwords do not match";
    }

    // DOB Validation
    if (!form.dob) {
      frontendErrors.dob = "Date of birth is required";
    } else {
      const selectedDate = new Date(form.dob);
      const today = new Date();

      // Remove time for accurate comparison
      today.setHours(0, 0, 0, 0);

      if (selectedDate >= today) {
        frontendErrors.dob = "Date of birth must be in the past";
      }
    }

    // STOP API call if frontend validation fails
    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      return;
    }

    setErrors({});

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        dob: form.dob,
      };

      const response = await registerUser(payload);

      setToastState({
        visible: true,
        message: "Registration successful! ",
        type: "success",
      });

      setTimeout(() => {
        setToastState((prev) => ({
          ...prev,
          visible: false,
        }));

        navigate("/login");
      }, 2000);

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
          backendErrors.general = response.message || "Something went wrong";
        }
      } else {
        backendErrors.general = "Something went wrong";
      }

      setErrors(backendErrors);

      setToastState({
        visible: true,
        message: backendErrors.general || "Registration failed",
        type: "error",
      });

      setTimeout(() => {
        setToastState((prev) => ({
          ...prev,
          visible: false,
        }));
      }, 3000);
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

        {/* Glass Card — max-w-lg is the key width reduction */}
        <div className="relative z-10 w-full max-w-lg p-6 md:p-8 rounded-xl bg-[#1a1a1a]/60 backdrop-blur-2xl">
          {/* Heading */}
          <div className="mb-6 text-center max-w-lg mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
              Create Your Vault
            </h1>

            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Securely store, manage, and share your files from one protected
              workspace.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
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
                className="w-full bg-[#131313] rounded-xl text-white py-2 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
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
                className="w-full bg-[#131313] rounded-xl text-white py-2 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Secure Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="vance@obsidian.network"
                onChange={handleChange}
                className="w-full bg-[#131313] rounded-xl text-white py-2 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
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
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full bg-[#131313] rounded-xl text-white py-2 px-4 pr-12 outline-none focus:ring-1 focus:ring-cyan-400"
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
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full bg-[#131313] rounded-xl text-white py-2 px-4 pr-12 outline-none focus:ring-1 focus:ring-cyan-400"
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
              <div className="sm:col-span-2 px-1 py-1 space-y-3">
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

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full bg-[#131313] rounded-xl text-white py-2 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
              {errors.dob && (
                <p className="text-red-400 text-xs mt-1">{errors.dob}</p>
              )}
            </div>

            <div className="sm:col-span-2 mt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-br from-[#98a9ff] to-[#4065ff] text-white font-extrabold text-base rounded-xl hover:shadow-[0_0_25px_rgba(152,169,255,0.4)] transition-all active:scale-95"
              >
                Join the Vault
              </button>
            </div>
          </form>

          {/* Bottom Info */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-400 text-sm">
              Already have an account?
              <Link
                to="/login"
                className="text-cyan-400 font-bold hover:underline ml-1"
              >
                Secure Login
              </Link>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 border-t border-zinc-700/30">
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
      <footer className="w-full py-6 bg-black flex flex-col items-center px-6 gap-4 md:flex-row md:justify-between md:px-12">
        <div className="text-xs tracking-wide text-gray-400 uppercase text-center md:text-left">
          © 2026 VaultLink. Protected storage. Trusted sharing.
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:flex-nowrap md:gap-8">
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

      <Toast
        message={toastState.message}
        visible={toastState.visible}
        type={toastState.type}
      />
    </div>
  );
};

export default RegisterPage;
