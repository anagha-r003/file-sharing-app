import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../App.css";

import TopBar from "../../components/sharedlink/TopBar";
import SharedByChip from "../../components/sharedlink/SharedByChip";
import FilePreviewCard from "../../components/sharedlink/FilePreviewCard";
import PageFooter from "../../components/sharedlink/PageFooter";
import Toast from "../../components/sharedlink/Toast";
import LinkExpired from "../../components/sharedlink/LinkExpired";

// ─── Demo data (replace with real props / API data) ───────────────────────────
// const FILE = {
//   fileName: "Project_Proposal.pdf",
//   fileType: "PDF",
//   fileSize: "2.4 MB",
//   pageCount: 14,
//   sharedDate: "Apr 28, 2026",
//   expiryDate: "May 15, 2026",
// };

// const SENDER = {
//   name: "Jerry",
//   email: "jerry@vaultlink.io",
//   initials: "J",
// };
// ─────────────────────────────────────────────────────────────────────────────

export default function SharedLinkPreviewPage() {
  const [toast, setToast] = useState({ visible: false, message: "" });
  const { token } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 3000);
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchSharedFile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/share/${token}`,
        );

        setFileData(response.data.data);
      } catch (error) {
        console.error(error);

        showToast("Failed to load shared file");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFile();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d14] text-white">
        Loading shared file...
      </div>
    );
  }

  if (!fileData) {
    return <LinkExpired />;
  }

  return (
    <>
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute"
          style={{
            width: "60%",
            height: "50%",
            top: 0,
            right: 0,
            background:
              "radial-gradient(ellipse at center, rgba(124,92,252,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "40%",
            height: "40%",
            bottom: 0,
            left: 0,
            background:
              "radial-gradient(ellipse at center, rgba(192,132,252,0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#0d0d14", color: "#f0eeff" }}
      >
        <TopBar expiryDate={fileData.expiresAt} isActive />

        <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-14 gap-7">
          <SharedByChip
            name={"Shared User"}
            email={fileData.recipientEmail}
            initials={fileData.recipientEmail?.charAt(0).toUpperCase()}
          />

          <FilePreviewCard
            fileName={fileData.fileName}
            fileType={fileData.fileName?.split(".").pop()}
            expiryDate={fileData.expiresAt}
            previewUrl={fileData.viewUrl}
            onDownload={() => {
              window.open(fileData.downloadUrl, "_blank");

              showToast("Download started!");
            }}
            onPreview={() => {
              window.open(fileData.viewUrl, "_blank");

              showToast("Opening preview...");
            }}
            onCopy={() => {
              navigator.clipboard.writeText(window.location.href);

              showToast("Link copied!");
            }}
          />
        </main>

        <PageFooter />

        <Toast message={toast.message} visible={toast.visible} />
      </div>
    </>
  );
}
