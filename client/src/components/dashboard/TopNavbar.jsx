import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ChevronDown } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";

function TopNavbar({ title, onMenuClick }) {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const displayName = user?.firstName || "User";

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-[#0c0e12]">
      {/* Left — hamburger + title */}
      <div className="flex items-center h-full">
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center text-slate-300 hover:text-white transition"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <h1 className="ml-4 text-[18px] font-semibold text-white leading-none translate-y-[-1px]">
          {title}
        </h1>
      </div>

      {/* Right — upload + notification + profile */}
      <div className="flex items-center gap-2 md:gap-3">
        <NotificationDropdown />

        {/* Profile Container - Added relative position and ref */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl transition ${isDropdownOpen ? "bg-white/10" : "hover:bg-white/5"}`}
          >
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg shadow-violet-600/20">
              {initials}
            </div>
            <span className="text-white text-sm font-medium hidden md:block">
              {displayName}
            </span>
            <ChevronDown
              size={14}
              className={`text-slate-400 hidden md:block transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Place Dropdown here */}
          <ProfileDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
