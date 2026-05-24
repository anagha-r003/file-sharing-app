import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import TopNavbar from "../../components/dashboard/TopNavbar";
import { getSharedWithMeFiles, downloadSharedFile } from "../../services/shareService";
import Toast from "../../components/sharedlink/Toast";

function SharedWithMePage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchSharedFiles();
  }, []);

  const fetchSharedFiles = async () => {
    try {
      setLoading(true);
      const response = await getSharedWithMeFiles();
      const pageData = response.data;
      const items = pageData.content ?? [];
      setFiles(items);
    } catch (error) {
      console.error("Failed to fetch shared files", error);
      showToast("Failed to fetch shared files", "error");
    } finally {
      setLoading(false);
    }
  };

  const getSharePreviewRoute = (file) => {
    if (file.token) {
      return `/public/share/${file.token}`;
    }
    if (file.shareToken) {
      return `/public/share/${file.shareToken}`;
    }
    if (file.shareUrl) {
      try {
        const parsedUrl = new URL(file.shareUrl);
        const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment) {
          return `/public/share/${lastSegment}`;
        }
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const handleDownload = async (token, fileName) => {
    try {
      showToast("Starting download...");
      await downloadSharedFile(token, fileName);
      showToast("Download completed successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to download file", "error");
    }
  };

  const handlePreview = (file) => {
    const previewRoute = getSharePreviewRoute(file);
    if (previewRoute) {
      navigate(previewRoute);
    } else if (file.shareUrl) {
      window.open(file.shareUrl, "_blank");
    } else {
      showToast("Preview not available.", "error");
    }
  };

  const filteredFiles = files.filter((f) =>
    f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.sharedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.sharedByEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFormatBytes = (bytes, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const getFormatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen bg-[#0c0e12] text-white overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopNavbar
          title="Shared with Me"
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Files Shared Directly with You</h2>
                <p className="text-sm text-slate-400 mt-1">Access files shared restricted directly to your account email, without OTP verification.</p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:max-w-xs">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search shared files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#13131a] border border-white/5 rounded-xl text-slate-200 text-sm pl-10 pr-4 py-2.5 outline-none focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/20 placeholder:text-slate-600 transition"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-16 text-center text-slate-500">
                <div className="animate-pulse font-medium text-slate-400">
                  Loading files shared with you...
                </div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-white/5 bg-[#111115]/50">
                <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">
                  folder_shared
                </span>
                <h3 className="text-lg font-bold text-slate-400">No shared files found</h3>
                <p className="text-sm text-slate-500 mt-1">Files shared directly to your email will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#111115]">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider bg-white/[0.01]">
                      <th className="px-6 py-4">File Name</th>
                      <th className="px-6 py-4">Shared By</th>
                      <th className="px-6 py-4">Expiry Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-violet-400 bg-violet-500/10 p-2 rounded-xl text-xl flex-shrink-0">
                              description
                            </span>
                            <div className="truncate">
                              <span className="font-semibold text-white group-hover:text-violet-400 transition truncate block">
                                {file.fileName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-medium text-slate-200 block">
                              {file.sharedByName}
                            </span>
                            <span className="text-xs text-slate-500 block mt-0.5">
                              {file.sharedByEmail}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-400">
                            {getFormatDate(file.expiresAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handlePreview(file)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-600 border border-violet-500/10 hover:border-violet-500 transition"
                          >
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                            Open File
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
      <Toast message={toast.message} visible={toast.visible} type={toast.type} />
    </div>
  );
}

export default SharedWithMePage;
