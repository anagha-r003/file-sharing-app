function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "font-semibold rounded-xl transition flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 disabled:opacity-30 disabled:grayscale",
    secondary:
      "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;