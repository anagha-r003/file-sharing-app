import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";

function PageLayout({
  title,
  children,
  sidebarOpen,
  onMenuClick,
  setSidebarOpen,
  contentClassName = "",
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0e12] text-white">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Top Navigation */}
        <TopNavbar title={title} onMenuClick={onMenuClick} />

        {/* Page Content */}
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-6 ${contentClassName}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default PageLayout;
