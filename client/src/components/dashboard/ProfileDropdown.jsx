import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../recyclebin/ConfirmModal";

const ProfileDropdown = ({ isOpen, onClose }) => {
  // ── All hooks first — before any early return ────────────────────────────
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ── Early return AFTER hooks ─────────────────────────────────────────────
  if (!isOpen) return null;

  const initials =
    (
      (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")
    ).toUpperCase() || "AR";

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Ann Roberts";

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    onClose();
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Backdrop — closes dropdown on outside click */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown panel */}
      <div
        className="absolute right-0 top-full mt-2.5 w-[248px] z-50
                   bg-[#13151a] border border-violet-900/40 rounded-2xl
                   shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_0_1px_rgba(124,58,237,0.15),0_0_24px_rgba(124,58,237,0.12)]
                   overflow-hidden
                   animate-in fade-in zoom-in-95 duration-150 origin-top-right"
      >
        {/* ── Identity header ── */}
        <div className="px-4 py-3.5 border-b border-[#1e2130]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full shrink-0
                         bg-gradient-to-br from-violet-700 to-purple-500
                         flex items-center justify-center
                         text-white text-xs font-bold
                         shadow-[0_0_0_2px_rgba(124,58,237,0.25)]"
            >
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate leading-tight">
                {fullName}
              </span>
              <span className="text-[11px] text-[#6b6b80] truncate mt-0.5 leading-tight">
                {user?.email || ""}
              </span>
            </div>
          </div>
        </div>

        {/* ── Menu items ── */}
        <div className="p-1.5 flex flex-col gap-0.5">
          {/* My Profile */}
          <button
            onClick={() => handleNavigate("/profile")}
            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                       hover:bg-[#1e2130] transition-colors duration-150 text-left"
          >
            <div
              className="w-7 h-7 rounded-lg shrink-0
                         bg-violet-950/60 border border-violet-800/30
                         flex items-center justify-center text-violet-400
                         group-hover:bg-violet-900/40 group-hover:border-violet-700/40
                         transition-colors duration-150"
            >
              <User size={14} />
            </div>
            <span
              className="flex-1 text-sm font-medium text-[#c9cad4]
                             group-hover:text-white transition-colors duration-150"
            >
              My Profile
            </span>
            <ChevronRight
              size={13}
              className="text-[#3a3d4d] group-hover:text-[#6b6b80]
                         transition-colors duration-150 -mr-0.5"
            />
          </button>

          {/* Divider */}
          <div className="mx-3 my-1 border-t border-[#1e2130]" />

          {/* Log Out */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                       hover:bg-red-950/30 transition-colors duration-150 text-left"
          >
            <div
              className="w-7 h-7 rounded-lg shrink-0
                         bg-red-950/40 border border-red-900/30
                         flex items-center justify-center text-red-400
                         group-hover:bg-red-900/40 group-hover:border-red-700/40
                         transition-colors duration-150"
            >
              <LogOut size={14} />
            </div>
            <span
              className="flex-1 text-sm font-medium text-[#c9cad4]
                             group-hover:text-red-400 transition-colors duration-150"
            >
              Log Out
            </span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal — same as Sidebar */}
      {showLogoutModal && (
        <ConfirmModal
          message="Are you sure you want to log out? You'll need to sign in again to access your vault."
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
};

export default ProfileDropdown;
