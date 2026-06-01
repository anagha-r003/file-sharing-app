import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Info,
  Eye,
  EyeOff,
  Check,
  XCircle,
  Calendar,
} from "lucide-react";
import { Card, Button } from "../../common/ui";
import { usePageSettings } from "../../context/LayoutContext";
import Toast from "../../components/sharedlink/Toast";
import { useAuth } from "../../context/AuthContext";
import {
  updateProfile,
  getProfile,
  changePassword,
} from "../../services/profileService";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Password strength
// ─────────────────────────────────────────────────────────────────────────────
function getStrength(val) {
  if (!val) return 0;
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;
  return score;
}

const STRENGTH_META = [
  { label: "Weak", bar: "bg-red-500", text: "text-red-400" },
  { label: "Fair", bar: "bg-amber-400", text: "text-amber-400" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-400" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared field components
// ─────────────────────────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-[#1a1d23] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5
                  text-white text-sm placeholder-[#4a4d5a] outline-none
                  focus:border-violet-600 focus:ring-2 focus:ring-violet-700/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-150 ${className}`}
    />
  );
}

function DateInput({ value, onChange }) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={onChange}
        max={new Date().toISOString().split("T")[0]} // can't pick a future date
        className="w-full bg-[#1a1d23] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5
                   text-white text-sm outline-none appearance-none
                   focus:border-violet-600 focus:ring-2 focus:ring-violet-700/20
                   transition-all duration-150
                   [color-scheme:dark]"
      />
      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a4d5a] pointer-events-none">
        <Calendar size={14} />
      </span>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type="password" style={{ display: "none" }} readOnly />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onCopy={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        autoComplete="new-password"
        className="w-full bg-[#1a1d23] border border-[#2a2d3a] rounded-xl px-3.5 pr-11 py-2.5
                   text-white text-sm placeholder-[#4a4d5a] outline-none
                   focus:border-violet-600 focus:ring-2 focus:ring-violet-700/20
                   transition-all duration-150"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4d5a]
                   hover:text-white transition-colors p-0.5"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function SectionCard({ icon, title, children }) {
  return (
    <Card className="bg-[#13151a] border border-[#1e2130] rounded-2xl p-6 md:p-7">
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#1e2130]">
        <div
          className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-800/30
                        flex items-center justify-center text-violet-400 shrink-0"
        >
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-white tracking-wide">
          {title}
        </h3>
      </div>
      {children}
    </Card>
  );
}

function useToast(duration = 3000) {
  const [toastState, setToastState] = useState({
    message: "",
    visible: false,
    type: "success",
  });

  const timerRef = useState(null);

  const showToast = (message, type = "success") => {
    if (timerRef[0]) clearTimeout(timerRef[0]);
    setToastState({ message, visible: true, type });
    timerRef[0] = setTimeout(() => {
      setToastState((prev) => ({ ...prev, visible: false }));
    }, duration);
  };

  return { toastState, showToast };
}

// ProfilePage

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  usePageSettings({ title: "My Profile" });

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");

  // Password form
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const { toastState, showToast } = useToast(3000);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const profileData = response.data;
        setFirstName(profileData.firstName || "");
        setLastName(profileData.lastName || "");
        setDob(profileData.dob || "");
        updateUser(profileData);
      } catch (error) {
        console.log("Profile fetch failed:", error);
      }
    };
    fetchProfile();
  }, []);

  // Derived
  const initials =
    ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "?";
  const displayName =
    [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || "User";
  const strength = getStrength(newPass);

  // Handlers
  const handleSaveInfo = async () => {
    try {
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();

      // First name validations
      if (!trimmedFirstName) {
        showToast("First name is required", "error");
        return;
      }

      if (trimmedFirstName.length < 2 || trimmedFirstName.length > 30) {
        showToast("First name must be 2 to 30 characters", "error");
        return;
      }

      if (!/^[A-Za-z_]+$/.test(trimmedFirstName)) {
        showToast(
          "First name can only contain letters and underscore",
          "error",
        );
        return;
      }

      // Last name validations
      if (!trimmedLastName) {
        showToast("Last name is required", "error");
        return;
      }

      if (trimmedLastName.length < 1 || trimmedLastName.length > 30) {
        showToast("Last name must be 1 to 30 characters", "error");
        return;
      }

      // DOB validation
      if (!dob) {
        showToast("Date of birth is required", "error");
        return;
      }

      const payload = {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        dob,
      };

      const response = await updateProfile(payload);
      updateUser(response.data);
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      console.log(error);
      showToast("Profile update failed", "error");
    }
  };

  const handleResetInfo = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setDob(user?.dob || "");
  };

  const handleSavePassword = async () => {
    if (currentPass === newPass) {
      showToast(
        "New password cannot be the same as the current password.",
        "error",
      );
      return;
    }
    if (!currentPass || !newPass || !confirmPass) {
      showToast("Please fill in all password fields.", "error");
      return;
    }
    if (newPass !== confirmPass) {
      showToast("New passwords do not match.", "error");
      return;
    }
    if (newPass.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }

    try {
      const payload = {
        currentPassword: currentPass,
        newPassword: newPass,
        confirmPassword: confirmPass,
      };
      const response = await changePassword(payload);
      showToast(
        response.message || "Password updated successfully!",
        "success",
      );
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (error) {
      showToast(error.message || "Failed to update password", "error");
    }
  };

  const handleResetPassword = () => {
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };

  return (
    <>
      <div className="max-w-3xl mx-auto w-full space-y-5">
        {/* Page heading */}
        <div className="mb-2">
          <h1 className="text-xl font-bold text-white mb-1">My Profile</h1>
          <p className="text-sm text-[#6b6b80]">
            Manage your personal information and account security.
          </p>
        </div>

        {/* Avatar banner */}
        <div
          className="relative bg-[#13151a] border border-[#1e2130] rounded-2xl px-6 py-5
                          flex items-center gap-5 overflow-hidden"
        >
          <div
            className="absolute -top-12 -left-12 w-48 h-48 bg-violet-700/10 rounded-full
                            blur-3xl pointer-events-none"
          />
          <div
            className="relative shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-full
                            bg-gradient-to-br from-violet-700 to-purple-500
                            flex items-center justify-center text-white text-2xl font-bold
                            shadow-[0_0_0_3px_rgba(124,58,237,0.18),0_0_22px_rgba(124,58,237,0.2)]"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-white truncate leading-tight">
              {displayName}
            </p>
            <p className="text-sm text-[#6b6b80] truncate mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <SectionCard icon={<User size={16} />} title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <FieldLabel>First Name</FieldLabel>
              <TextInput
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>Last Name</FieldLabel>
              <TextInput
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>

            {/* ── CHANGE 7: Date of Birth field added here ── */}
            <div className="flex flex-col gap-2">
              <FieldLabel>Date of Birth</FieldLabel>
              <DateInput value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-7">
            <FieldLabel>Email Address</FieldLabel>
            <div className="relative">
              <TextInput value={user?.email || ""} disabled className="pr-10" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a4d5a]">
                <Lock size={14} />
              </span>
            </div>
            <p className="flex items-center gap-1.5 text-[11.5px] text-[#4a4d5a] mt-0.5">
              <Info size={12} />
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div className="flex justify-end gap-2.5">
            <Button
              variant="ghost"
              onClick={handleResetInfo}
              className="px-5 py-2 rounded-xl text-sm font-semibold border border-[#2a2d3a]
                           text-[#6b6b80] hover:border-[#6b6b80] hover:text-white transition-all"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveInfo}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-violet-700 text-white
                           hover:bg-violet-600 hover:-translate-y-px
                           hover:shadow-[0_4px_14px_rgba(124,58,237,0.35)]
                           active:translate-y-0 transition-all"
            >
              Save Changes
            </Button>
          </div>
        </SectionCard>

        {/* Change Password — completely unchanged */}
        <SectionCard icon={<Lock size={16} />} title="Change Password">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <FieldLabel>Current Password</FieldLabel>
              <PasswordInput
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                autoComplete="off"
                placeholder="••••••••"
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>New Password</FieldLabel>
              <PasswordInput
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
              />
              <div className="flex gap-1 mt-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-[3px] rounded-full transition-all duration-300
                                  ${
                                    newPass && i < strength
                                      ? STRENGTH_META[strength - 1].bar
                                      : "bg-[#2a2d3a]"
                                  }`}
                  />
                ))}
              </div>
              <p
                className={`text-[11px] h-4 transition-colors
                               ${
                                 newPass && strength
                                   ? STRENGTH_META[strength - 1].text
                                   : "text-transparent"
                               }`}
              >
                {newPass && strength ? STRENGTH_META[strength - 1].label : "·"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>Confirm Password</FieldLabel>
              <PasswordInput
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
              />
              {confirmPass && (
                <p
                  className={`text-[11px] flex items-center gap-1 mt-0.5
                                 ${newPass === confirmPass ? "text-emerald-400" : "text-red-400"}`}
                >
                  {newPass === confirmPass ? (
                    <Check size={15} strokeWidth={2.5} />
                  ) : (
                    <XCircle size={15} />
                  )}
                  {newPass === confirmPass
                    ? "Passwords match"
                    : "Passwords don't match"}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2.5">
            <Button
              variant="ghost"
              onClick={handleResetPassword}
              className="px-5 py-2 rounded-xl text-sm font-semibold border border-[#2a2d3a]
                           text-[#6b6b80] hover:border-[#6b6b80] hover:text-white transition-all"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePassword}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-violet-700 text-white
                           hover:bg-violet-600 hover:-translate-y-px
                           hover:shadow-[0_4px_14px_rgba(124,58,237,0.35)]
                           active:translate-y-0 transition-all"
            >
              Update Password
            </Button>
          </div>
        </SectionCard>
      </div>

      <Toast
        message={toastState.message}
        visible={toastState.visible}
        type={toastState.type}
      />
    </>
  );
}
