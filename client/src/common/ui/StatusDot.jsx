function StatusDot({ status = "active", className = "" }) {
  const statusStyles = {
    active: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
    inactive: "bg-slate-500",
    expired: "bg-red-500",
    warning: "bg-yellow-500",
  };

  return (
    <span
      className={`w-2 h-2 rounded-full ${statusStyles[status]} ${className}`}
    ></span>
  );
}

export default StatusDot;
