export default function SharedByChip({ name, email, initials }) {
  return (
    <div
      className="animate-fade-up-1 flex items-center gap-2.5 px-4 py-1.5 rounded-full mono text-xs"
      style={{
        background: "rgba(19,19,31,1)",
        border: "1px solid rgba(255,255,255,0.07)",
        color: "#7b7a99",
      }}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#7c5cfc,#c084fc)" }}
      >
        {initials || "?"}
      </div>

      <span>
        Shared by{" "}
        <span className="font-semibold" style={{ color: "#f0eeff" }}>
          {name || "Unknown User"}
        </span>{" "}
        · {email}
      </span>
    </div>
  );
}
