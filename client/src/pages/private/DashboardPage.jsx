import { useState, useEffect } from "react";
import SummaryCards from "../../components/dashboard/SummaryCards";
import QuickUploadCard from "../../components/dashboard/QuickUploadCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import StorageHealth from "../../components/dashboard/StorageHealth";
import PageLayout from "../../layout/PageLayout";
import { useAuth } from "../../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <PageLayout
      title="Dashboard"
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onMenuClick={() => setSidebarOpen((prev) => !prev)}
      contentClassName="lg:p-8 space-y-6 md:space-y-8"
    >
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
          Welcome back, {user?.firstName || user?.name || "User"}
        </h2>

        <p className="text-slate-500 text-sm md:text-base mt-1">
          Your enterprise environment is currently operating within optimal
          parameters.
        </p>
      </header>

      <SummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <QuickUploadCard />
          <RecentActivity />
        </div>

        <div className="lg:col-span-1">
          <StorageHealth />
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
