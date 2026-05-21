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

export default function SharedLinkPreviewPage() {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const { token } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 3000);
  };

  useEffect(() => {
    if (!token) return;

    const fetchSharedFile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/share/${token}`,
        );
        console.log(response.data.data);
        setFileData(response.data.data);
      } catch (error) {
        console.log("FULL ERROR:", error);
        console.log("BACKEND RESPONSE:", error.response?.data);
        console.log("STATUS:", error.response?.status);
        showToast(
          error.response?.data?.message || "Failed to load shared file",
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFile();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d14] text-white text-sm">
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

        <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-14 gap-5 sm:gap-7">
          <SharedByChip
            name={fileData?.sharedByName}
            email={fileData?.sharedByEmail}
            initials={fileData?.sharedByName
              ?.split(" ")
              ?.map((n) => n[0])
              ?.join("")
              ?.toUpperCase()}
          />

          {/* Card fills width on mobile, capped on desktop */}
          <div className="w-full" style={{ maxWidth: 680 }}>
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
          </div>
        </main>

        <PageFooter />

        <Toast
          message={toast.message}
          visible={toast.visible}
          type={toast.type}
        />
      </div>
    </>
  );
}
