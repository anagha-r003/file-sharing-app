function Badge({ children, variant = "default", className = "" }) {
  const baseStyles = "px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border";

  const variants = {
    default: "bg-slate-800 text-slate-300 border-white/5",
    success:
      "bg-green-400/10 text-green-400 border-green-400/20",
    error: "bg-red-400/10 text-red-400 border-red-400/20",
    warning:
      "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    info: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    violet:
      "bg-violet-400/10 text-violet-400 border-violet-400/20",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;