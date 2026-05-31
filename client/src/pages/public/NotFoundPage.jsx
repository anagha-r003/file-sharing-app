export default function VaultLink404() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#0d0d12", fontFamily: "system-ui, sans-serif" }}
    >
      <div className="flex flex-col items-center text-center gap-5 max-w-sm w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #a855f7, #4f46e5)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1L12 4V10L7 13L2 10V4L7 1Z"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="7" cy="7" r="2" fill="white" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm tracking-wide">
            VaultLink
          </span>
        </div>

        {/* 404 */}
        <p
          className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text leading-none"
          style={{
            backgroundImage: "linear-gradient(135deg, #a855f7, #4f46e5)",
          }}
        >
          404
        </p>

        {/* Text */}
        <h1 className="text-white text-xl font-semibold">Page not found</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          The file or vault you're looking for doesn't exist or has been moved.
        </p>
      </div>
    </div>
  );
}
