import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Dashboard", icon: "grid_view", path: "/dashboard" },
  { label: "My Files", icon: "description", path: "/my-files" },
  { label: "My Collections", icon: "folder", path: "/my-folders" },
  { label: "Shared with Me", icon: "folder_shared", path: "/shared-with-me" },
  { label: "Shared Links", icon: "share", path: "/shared-links" },
  { label: "Analytics", icon: "bar_chart", path: "/analytics" },
  { label: "Starred", icon: "star", path: "/starred" },
  { label: "Recycle Bin", icon: "delete", path: "/recycle-bin" },
];

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  return (
    <>
      {/* Mobile overlay — only shown when sidebar is open on small screens */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          flex flex-col border-r border-white/5 bg-[#111111]
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-0 lg:w-16 overflow-hidden"}
        `}
      >
        {/* Logo */}
        <div className="px-4 py-6 flex items-center justify-center lg:justify-start overflow-hidden">
          {isOpen ? (
            <span className="text-xl font-black pl-2 text-violet-400 font-['Space_Grotesk'] whitespace-nowrap">
              VaultLink
            </span>
          ) : (
            <span className="text-xl font-black pl-2 text-violet-400 font-['Space_Grotesk'] hidden lg:block">
              V
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 space-y-1 overflow-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              title={!isOpen ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap
                ${isOpen ? "" : "lg:justify-center"}
                ${
                  isActive
                    ? "bg-violet-600/20 text-violet-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <span className="material-symbols-outlined text-xl flex-shrink-0">
                {item.icon}
              </span>
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 pb-6 space-y-1 overflow-hidden">
          <button
            onClick={() => navigate("/support")}
            title={!isOpen ? "Support" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition w-full whitespace-nowrap ${
              isOpen ? "" : "lg:justify-center"
            }`}
          >
            <span className="material-symbols-outlined text-xl flex-shrink-0">
              help
            </span>
            {isOpen && <span>Support</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
