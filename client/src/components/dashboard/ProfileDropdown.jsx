import { useNavigate } from "react-router-dom";
const ProfileDropdown = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-[#161922] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in duration-200">
      {/* User Identity Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-600/20">
            J
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">
              Jerry Smith
            </span>
            <span className="text-[11px] text-slate-500 truncate font-medium">
              jerry.smith@vaultlink.io
            </span>
          </div>
        </div>
      </div>

      {/* Dropdown Options */}
      <div className="p-2">
        {/* Profile */}
        <button
          onClick={() => navigate("/my-profile")}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center group-hover:bg-blue-400/20 transition">
            <span className="material-symbols-outlined text-blue-400 text-lg">
              account_circle
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition">
              My Profile
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Personal account details
            </span>
          </div>
        </button>

        {/* Settings */}
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition group text-left">
          <div className="w-8 h-8 rounded-lg bg-violet-400/10 flex items-center justify-center group-hover:bg-violet-400/20 transition">
            <span className="material-symbols-outlined text-violet-400 text-lg">
              settings
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition">
              Settings
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Preferences
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
