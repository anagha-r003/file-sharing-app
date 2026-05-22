import { useState } from "react";
import PageLayout from "../../layout/PageLayout";

import WeeklyActivityCard from "../../components/analytics/Weeklyactivitycard";
import ShareStatusCard from "../../components/analytics/Sharestatuscard ";
import SharesTrendCard from "../../components/analytics/Sharestrendcard";
import SharesPerDayCard from "../../components/analytics/Sharesperdaycard ";
import LargestFilesCard from "../../components/analytics/Largestfilescard ";

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <PageLayout
      title="Analytics"
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onMenuClick={() => setSidebarOpen((prev) => !prev)}
    >
      <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
        {/* Row 1 — Weekly Activity + Share Status */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-5">
          <WeeklyActivityCard />
          <ShareStatusCard />
        </div>

        {/* Row 2 — Shares Trend (full width, with toggle) */}
        <SharesTrendCard />

        {/* Row 3 — Shares per Day (full width) */}
        <SharesPerDayCard />

        {/* Row 4 — Peak Hours + Largest Files */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-5">
          <LargestFilesCard />
        </div>
      </div>
    </PageLayout>
  );
}
