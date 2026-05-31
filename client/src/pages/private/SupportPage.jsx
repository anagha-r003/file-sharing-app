import { useState } from "react";
import { sendSupportMessage } from "../../services/supportService";
import { usePageSettings } from "../../context/LayoutContext";
import {
  MessageCircle,
  ChevronDown,
  Search,
  CheckCircle,
  Mail,
  Upload,
  Share2,
  Shield,
  Folder,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    category: "Files & Uploads",
    icon: <Upload size={15} />,
    color: "violet",
    questions: [
      {
        q: "What file types can I upload to VaultLink?",
        a: "VaultLink supports common file types including documents (PDF, DOC, DOCX, TXT, CSV, Excel, PowerPoint), images (JPG, JPEG, PNG, GIF, WEBP, SVG), videos (MP4, WEBM, MKV), audio (MP3), and compressed files (ZIP).",
      },
      {
        q: "Is there a file size limit?",
        a: "Yes, individual file uploads are limited to 100MB, and the total storage capacity provided is 1GB.",
      },
      {
        q: "Can I upload multiple files at once?",
        a: "Yes! You can drag and drop multiple files onto the upload area on the Dashboard.",
      },
    ],
  },
  {
    category: "Sharing & Links",
    icon: <Share2 size={15} />,
    color: "teal",
    questions: [
      {
        q: "How do shared links work?",
        a: "When you share a file, VaultLink generates a secure link that can be shared in either public or private mode. Public links can be accessed directly, while private links require verification to access the shared file.",
      },
      {
        q: "Can I revoke a shared link?",
        a: "Yes. Go to the Shared Links section, find the link you want to disable, and click the Revoke button to instantly remove access to the shared file.",
      },
      {
        q: "Can I send a file to multiple people at a time?",
        a: "Yes. VaultLink allows you to share a file with multiple people at once, and each recipient receives a unique secure link for access.",
      },
    ],
  },
  {
    category: "Account & Security",
    icon: <Shield size={15} />,
    color: "amber",
    questions: [
      {
        q: "How secure are my files in VaultLink?",
        a: "VaultLink ensures secure file storage and sharing. Private shared files require verification before access, helping protect your data from unauthorized users.",
      },
      {
        q: "Can I change my email address?",
        a: "Email addresses are tied to your account identity and cannot be changed directly. Please contact our support team at support@vaultlink.io to request an email change.",
      },
      {
        q: "How does private file sharing work?",
        a: "In private mode, access is restricted to verified recipients. If the recipient has a VaultLink account, files can be shared directly through the system. Otherwise, access is provided through email verification using OTP.",
      },
    ],
  },
  {
    category: "File Vaults",
    icon: <Folder size={15} />,
    color: "pink",
    questions: [
      {
        q: "What is a File Vault?",
        a: "A File Vault is a way to organize your files into groups for better management. It helps you keep related files together, making them easier to access, manage, and share.",
      },
      {
        q: "Can I nest vaults inside each other?",
        a: "Currently, VaultLink supports one level of vaults. ",
      },
    ],
  },
];

const COLOR_MAP = {
  violet: {
    bg: "bg-violet-950/50",
    border: "border-violet-800/30",
    icon: "text-violet-400",
    badge: "bg-violet-950/60 border-violet-800/30 text-violet-400",
  },
  teal: {
    bg: "bg-teal-950/50",
    border: "border-teal-800/30",
    icon: "text-teal-400",
    badge: "bg-teal-950/60 border-teal-800/30 text-teal-400",
  },
  amber: {
    bg: "bg-amber-950/50",
    border: "border-amber-800/30",
    icon: "text-amber-400",
    badge: "bg-amber-950/60 border-amber-800/30 text-amber-400",
  },
  pink: {
    bg: "bg-pink-950/50",
    border: "border-pink-800/30",
    icon: "text-pink-400",
    badge: "bg-pink-950/60 border-pink-800/30 text-pink-400",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Accordion Item
// ─────────────────────────────────────────────────────────────────────────────
function AccordionItem({ q, a, isOpen, onToggle }) {
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200
                  ${isOpen ? "border-violet-800/40 bg-violet-950/10" : "border-[#1e2130] bg-[#13151a]"}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span
          className={`text-sm font-medium transition-colors duration-150
                          ${isOpen ? "text-white" : "text-[#c9cad4]"}`}
        >
          {q}
        </span>
        <span
          className={`shrink-0 transition-colors duration-150
                          ${isOpen ? "text-violet-400" : "text-[#3a3d4d]"}`}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      <div
        className={`transition-all duration-200 ease-in-out
                    ${isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
      >
        <div className="px-5 pb-4 border-t border-[#1e2130]">
          <p className="text-sm text-[#6b6b80] leading-relaxed pt-4">{a}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Category Block
// ─────────────────────────────────────────────────────────────────────────────
function FAQCategory({ category, icon, color, questions }) {
  const [openIndex, setOpenIndex] = useState(null);
  const c = COLOR_MAP[color];

  return (
    <div className="bg-[#13151a] border border-[#1e2130] rounded-2xl p-5 md:p-6">
      {/* Category header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0
                         ${c.bg} ${c.border} ${c.icon}`}
        >
          {icon}
        </div>
        <span className="text-sm font-semibold text-white tracking-wide">
          {category}
        </span>
        <span
          className={`ml-auto text-[10px] font-semibold uppercase tracking-widest
                          border px-2 py-0.5 rounded-full ${c.badge}`}
        >
          {questions.length} FAQs
        </span>
      </div>

      {/* Accordion questions */}
      <div className="flex flex-col gap-2">
        {questions.map((item, i) => (
          <AccordionItem
            key={i}
            q={item.q}
            a={item.a}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact Card
// ─────────────────────────────────────────────────────────────────────────────
function ContactCard() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ subject: "", message: "" });

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await sendSupportMessage(form);
      setSubmitted(true);
      setForm({ subject: "", message: "" });
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError(err?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#13151a] border border-[#1e2130] rounded-2xl p-5 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1e2130]">
        <div
          className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-800/30
                        flex items-center justify-center text-violet-400 shrink-0"
        >
          <MessageCircle size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Contact Support</h3>
          <p className="text-[11px] text-[#6b6b80] mt-0.5">
            We reply via email
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-medium">
            Online
          </span>
        </div>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
          <div
            className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-800/30
                          flex items-center justify-center text-emerald-400"
          >
            <CheckCircle size={22} />
          </div>
          <p className="text-sm font-semibold text-white">Message sent!</p>
          <p className="text-xs text-[#6b6b80]">
            Your message has been sent to the administrator.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Subject */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest">
              Subject
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) =>
                setForm((f) => ({ ...f, subject: e.target.value }))
              }
              placeholder="e.g. Unable to share a file"
              disabled={loading}
              className="w-full bg-[#1a1d23] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5
                         text-white text-sm placeholder-[#4a4d5a] outline-none
                         focus:border-violet-600 focus:ring-2 focus:ring-violet-700/20
                         transition-all duration-150 disabled:opacity-50"
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest">
              Message
            </label>
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              placeholder="Describe your issue in detail..."
              rows={5}
              disabled={loading}
              className="w-full bg-[#1a1d23] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5
                         text-white text-sm placeholder-[#4a4d5a] outline-none resize-none
                         focus:border-violet-600 focus:ring-2 focus:ring-violet-700/20
                         transition-all duration-150 disabled:opacity-50"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-xs text-red-500 bg-red-950/20 border border-red-800/30 px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          {/* Email note */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                          bg-[#1a1d23] border border-[#2a2d3a]"
          >
            <Mail size={13} className="text-[#4a4d5a] shrink-0" />
            <span className="text-[11.5px] text-[#6b6b80]">
              Reply will be sent to your registered email address.
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !form.subject.trim() || !form.message.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-violet-700 text-white
                       hover:bg-violet-600 hover:-translate-y-px
                       hover:shadow-[0_4px_14px_rgba(124,58,237,0.35)]
                       active:translate-y-0 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0
                       disabled:hover:shadow-none"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SupportPage
// ─────────────────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const [search, setSearch] = useState("");

  usePageSettings({ title: "Support" });

  // Filter FAQ questions across all categories by search term
  const filteredFAQs = FAQ_ITEMS.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (item) =>
        !search.trim() ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((cat) => cat.questions.length > 0);

  return (
    <>
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* ── Page heading ── */}
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Support</h1>
          <p className="text-sm text-[#6b6b80]">
            Find answers, browse docs, or reach out to our team.
          </p>
        </div>

        {/* ── Hero search banner ── */}
        <div className="relative bg-[#13151a] border border-[#1e2130] rounded-2xl px-6 py-7 overflow-hidden">
          {/* Ambient glow */}
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-40
                          bg-violet-700/10 rounded-full blur-3xl pointer-events-none"
          />
          <div className="relative z-10 max-w-xl mx-auto text-center">
            <h2 className="text-lg font-bold text-white mb-1">
              How can we help?
            </h2>
            <p className="text-sm text-[#6b6b80] mb-5">
              Search our knowledge base or browse FAQs below.
            </p>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a4d5a]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search FAQs — e.g. 'shared links', 'file size'..."
                className="w-full bg-[#1a1d23] border border-[#2a2d3a] rounded-xl
                           pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4a4d5a]
                           outline-none focus:border-violet-600 focus:ring-2
                           focus:ring-violet-700/20 transition-all duration-150"
              />
            </div>
          </div>
        </div>

        {/* ── Main content: FAQ + Contact side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          {/* FAQs */}
          <div className="flex flex-col gap-4">
            {search.trim() && filteredFAQs.length === 0 ? (
              <div className="bg-[#13151a] border border-[#1e2130] rounded-2xl p-10 text-center">
                <Search size={28} className="mx-auto text-[#3a3d4d] mb-3" />
                <p className="text-sm font-medium text-[#c9cad4] mb-1">
                  No results found
                </p>
                <p className="text-xs text-[#4a4d5a]">
                  Try different keywords or send us a message directly.
                </p>
              </div>
            ) : (
              filteredFAQs.map((cat) => (
                <FAQCategory key={cat.category} {...cat} />
              ))
            )}
          </div>

          {/* Contact form — sticky on desktop */}
          <div className="lg:sticky lg:top-6">
            <ContactCard />

            {/* Response time card */}
            <div className="mt-4 bg-[#13151a] border border-[#1e2130] rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest mb-3">
                Response Times
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    label: "Critical issues",
                    time: "< 2 hours",
                    dot: "bg-red-400",
                  },
                  {
                    label: "General support",
                    time: "< 24 hours",
                    dot: "bg-amber-400",
                  },
                  {
                    label: "Feature requests",
                    time: "2–5 business days",
                    dot: "bg-violet-400",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.dot}`}
                      />
                      <span className="text-xs text-[#6b6b80]">
                        {row.label}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#c9cad4]">
                      {row.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
