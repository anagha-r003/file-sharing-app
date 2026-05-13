import { useState, useEffect } from "react";
import SummaryCards from "../../components/dashboard/SummaryCards";
import QuickUploadCard from "../../components/dashboard/QuickUploadCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import StorageHealth from "../../components/dashboard/StorageHealth";
import PageLayout from "../../layout/PageLayout";
import { useAuth } from "../../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1); // triggers re-fetch
  };

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
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

      <SummaryCards refreshKey={refreshKey} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <QuickUploadCard onUploadComplete={handleRefresh} />
          <RecentActivity refreshKey={refreshKey} />
        </div>
        <div className="lg:col-span-1">
          <StorageHealth refreshKey={refreshKey} />
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
