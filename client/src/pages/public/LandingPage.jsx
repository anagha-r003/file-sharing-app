import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
const features = [
  {
    icon: "📁",
    title: "My Files",
    desc: "Upload and manage all your documents, images and videos in one place.",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
    text: "text-violet-400",
  },
  {
    icon: "🗄️",
    title: "My Vaults",
    desc: "Group related files into dedicated vaults. Organised the way you think.",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
  },
  {
    icon: "🔗",
    title: "Shared Links",
    desc: "Generate links to share files instantly and track all your active shares.",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/20",
    text: "text-orange-400",
  },
  {
    icon: "👥",
    title: "Shared With Me",
    desc: "Access everything others have shared directly with you.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
  {
    icon: "⭐",
    title: "Starred",
    desc: "Pin your most-used files for instant access without searching.",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
    text: "text-amber-400",
  },
  {
    icon: "🗑️",
    title: "Recycle Bin",
    desc: "Nothing is gone for good. Restore any deleted file whenever you need.",
    color: "from-red-500/20 to-red-500/5",
    border: "border-red-500/20",
    text: "text-red-400",
  },
];

const floatingIcons = [
  { icon: "📁", top: "12%", left: "6%", rotate: "-12deg", delay: "0s" },
  { icon: "🔐", top: "18%", right: "7%", rotate: "10deg", delay: "0.4s" },
  { icon: "🔗", top: "55%", left: "4%", rotate: "8deg", delay: "0.8s" },
  { icon: "⭐", top: "60%", right: "5%", rotate: "-8deg", delay: "0.2s" },
  { icon: "🗄️", top: "78%", left: "10%", rotate: "14deg", delay: "1s" },
  { icon: "👥", top: "75%", right: "9%", rotate: "-14deg", delay: "0.6s" },
];

function FloatingIcon({ icon, top, left, right, rotate, delay }) {
  return (
    <div
      className="absolute pointer-events-none select-none hidden lg:flex items-center justify-center rounded-2xl text-xl"
      style={{
        top,
        left,
        right,
        width: "52px",
        height: "52px",
        background: "rgba(139,92,246,0.12)",
        border: "1px solid rgba(139,92,246,0.2)",
        backdropFilter: "blur(8px)",
        transform: `rotate(${rotate})`,
        animation: `floatIcon 4s ease-in-out ${delay} infinite`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      }}
    >
      {icon}
    </div>
  );
}

function FeatureCard({ icon, title, desc, color, border, text, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-2xl border p-6 cursor-default overflow-hidden ${border}`}
      style={{
        background: "#111118",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(24px) scale(0.98)",
        transition: `opacity 0.6s ease ${index * 0.08}s, transform 0.6s ease ${index * 0.08}s, box-shadow 0.3s ease`,
        boxShadow: hovered
          ? "0 12px 40px rgba(0,0,0,0.5)"
          : "0 2px 12px rgba(0,0,0,0.2)",
      }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} transition-opacity duration-300`}
        style={{ opacity: hovered ? 1 : 0 }}
      />
      <div className="relative">
        <span className="text-2xl mb-4 block">{icon}</span>
        <h3 className={`font-semibold text-sm mb-2 ${text}`}>{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function VaultLinkLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => {
      window.removeEventListener("scroll", fn);
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-[#0a0a14] text-white overflow-x-hidden"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* NAV */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a14]/90 backdrop-blur-md border-b border-white/[0.06]" : ""}`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-14 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-900/40">
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
            <span className="font-bold text-base tracking-tight">
              VaultLink
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:inline-flex px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition-opacity shadow-lg shadow-violet-900/30"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 sm:px-14 pt-16 overflow-hidden">
        {/* Deep purple background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(109,40,217,0.35) 0%, rgba(79,48,160,0.15) 40%, transparent 70%)",
            }}
          />
        </div>

        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 90% 90% at 50% 40%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 90% at 50% 40%, black 20%, transparent 75%)",
          }}
        />

        {/* Floating icons */}
        {floatingIcons.map((f, i) => (
          <FloatingIcon key={i} {...f} />
        ))}

        {/* Content */}
        <div
          className="relative z-10 max-w-2xl w-full"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-7"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 0.6s ease 0.1s",
            }}
          >
            <span>🔒</span>
            Secure file management
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-5"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
            }}
          >
            <span className="text-white">Store your files.</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Build your vault.
            </span>
            <br />
            <span className="text-gray-400">Share anywhere.</span>
          </h1>

          {/* Subtext */}
          <p
            className="text-gray-400 text-base max-w-sm mx-auto mb-9 leading-relaxed"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 0.7s ease 0.35s",
            }}
          >
            Store your files in vaults and share them with anyone via a link.
          </p>

          {/* Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 0.7s ease 0.5s",
            }}
          >
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition-opacity shadow-xl shadow-violet-900/40"
            >
              Get started →
            </button>
            <button
              onClick={() =>
                document.getElementById("features")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-gray-300 text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              See how it works
            </button>
          </div>

          <p
            className="mt-14 text-gray-600 text-xs uppercase tracking-widest"
            style={{
              opacity: heroVisible ? 0.5 : 0,
              transition: "opacity 1s ease 1.2s",
            }}
          >
            Explore the power of vaults
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 sm:px-14 pb-28" id="features">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.05] py-8 text-center">
        <p className="text-gray-700 text-xs">
          © 2026 VaultLink. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
