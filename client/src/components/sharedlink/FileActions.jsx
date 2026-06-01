
export default function FileActions({ onDownload, onPreview, onCopy }) {
  return (
    <div className="px-5 sm:px-7 py-5 flex items-center justify-between gap-2">
      {/* Left group — Download + Open preview */}
      <div className="flex items-center gap-2">
        {/* Primary — Download */}
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, #7c5cfc, #a855f7)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(124,92,252,0.35)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "0 6px 28px rgba(124,92,252,0.55)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              "0 4px 20px rgba(124,92,252,0.35)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            download
          </span>
          Download
        </button>

        {/* Secondary — Open preview */}
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "#c4b5fd",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.09)";
            e.currentTarget.style.borderColor = "rgba(168,139,250,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            open_in_new
          </span>
          Open preview
        </button>
      </div>

      {/* Right — Copy link, always pinned to the right */}
      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0"
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "#7b7a99",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#f0eeff";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#7b7a99";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          content_copy
        </span>
        Copy link
      </button>
    </div>
  );
}
