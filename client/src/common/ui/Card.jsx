function Card({ children, className = "" }) {
  return (
    <div
      className={`custom-card rounded-2xl border border-white/5 p-4 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;