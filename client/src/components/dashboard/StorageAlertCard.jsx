import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getStorageStats } from "../../services/dashboardService";

export default function StorageAlertCard({ refreshKey }) {
  const [percentage, setPercentage] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStorageStats();
        setPercentage(data.percentage);
      } catch (err) {
        console.error("Failed to load storage alert:", err);
      }
    };

    fetchStats();
  }, [refreshKey]);

  if (percentage === null || percentage < 80) {
    return null;
  }

  const isCritical = percentage >= 90;

  return (
    <div
      className={`rounded-[14px] p-4 border flex items-start gap-3 ${
        isCritical
          ? "bg-red-500/10 border-red-500/30"
          : "bg-amber-500/10 border-amber-500/30"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isCritical ? "bg-red-500/15" : "bg-amber-500/15"
        }`}
      >
        <AlertTriangle
          size={18}
          className={isCritical ? "text-red-400" : "text-amber-400"}
        />
      </div>
      <div className="min-w-0">
        <p
          className={`text-[13px] font-bold mb-1 ${
            isCritical ? "text-red-300" : "text-amber-300"
          }`}
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {isCritical ? "Storage Critically Full" : "Storage Almost Full"}
        </p>
        <p
          className={`text-[12px] leading-relaxed ${
            isCritical ? "text-red-400/80" : "text-amber-400/80"
          }`}
        >
          {isCritical
            ? "Storage critically full. Delete unnecessary files to continue uploading."
            : "Clean up unused files to avoid upload issues."}
        </p>
      </div>
    </div>
  );
}
