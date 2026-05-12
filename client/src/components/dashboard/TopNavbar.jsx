import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, ChevronDown } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown"; // Import the dropdown component we designed

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

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-[#0c0e12]">
      {/* Left — hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
          aria-label="Toggle sidebar"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-base md:text-xl font-bold text-white font-['Space_Grotesk']">
          {title}
        </h1>
      </div>

      {/* Right — upload + notification + profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-white text-sm font-semibold transition shadow-lg shadow-violet-600/20">
          <span className="material-symbols-outlined text-base">
            upload_file
          </span>
          <span className="hidden sm:inline">Upload Files</span>
        </button> */}

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

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
              {user?.name || "User"}
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
