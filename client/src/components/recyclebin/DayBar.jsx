function DaysBar({ daysLeft }) {
  const pct = Math.round(((30 - daysLeft) / 30) * 100);
  const urgent = daysLeft <= 3;
  const warning = daysLeft <= 7;
  const barColor = urgent
    ? "bg-red-500"
    : warning
      ? "bg-orange-400"
      : "bg-lime-400";
  const textColor = urgent
    ? "text-red-400"
    : warning
      ? "text-orange-400"
      : "text-lime-400";

  return (
    <div className="flex items-center gap-2">
      <div className="w-12 sm:w-16 h-1 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-semibold whitespace-nowrap ${textColor}`}>
        {daysLeft}d left
      </span>
    </div>
  );
}

export default DaysBar;
