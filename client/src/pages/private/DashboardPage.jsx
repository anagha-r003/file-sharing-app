import { useState } from "react";
import SummaryCards from "../../components/dashboard/SummaryCards";
import QuickUploadCard from "../../components/dashboard/QuickUploadCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import StorageHealth from "../../components/dashboard/StorageHealth";
import { useAuth } from "../../context/AuthContext";
import { usePageSettings } from "../../context/LayoutContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  usePageSettings({
    title: "Dashboard",
    contentClassName: "lg:p-8 space-y-6 md:space-y-8",
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1); // triggers re-fetch
  };

  return (
    <>
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
    </>
  );
};

export default DashboardPage;
