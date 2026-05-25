import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import "../../App.css";

import TopBar from "../../components/sharedlink/TopBar";
import SharedByChip from "../../components/sharedlink/SharedByChip";
import FilePreviewCard from "../../components/sharedlink/FilePreviewCard";
import PageFooter from "../../components/sharedlink/PageFooter";
import Toast from "../../components/sharedlink/Toast";
import LinkExpired from "../../components/sharedlink/LinkExpired";
import OtpModal from "../../components/restrictedshare/OtpModal";

export default function SharedLinkPreviewPage() {
  const { token } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  // Modal states
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  // Loading states
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResending, setOtpResending] = useState(false);

  // For passing to OtpModal
  const [otpError, setOtpError] = useState("");

  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);



  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 3000);
  };

  // Step 1 — fetch share link info
  useEffect(() => {
    if (!token) return;
    const fetchSharedFile = async () => {
      try {
        const response = await api.get(`/share/${token}`);
        const data = response.data.data;
        setFileData(data);

        // If restricted, open OTP modal immediately
        if (data.requiresOtp) {
          setOtpModalOpen(true);
        } else {
          setAccessGranted(true);
        }
      } catch (error) {
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

  // Step 2 — send OTP for restricted access
  const handleSendOtp = async () => {
    setOtpSending(true);

    try {
      await api.post("/share/request-otp", {
        token,
      });
      showToast("OTP sent to your email!");
      return true;
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to send OTP", "error");
      return false;
    } finally {
      setOtpSending(false);
    }
  };

  // Step 3 — user submits OTP → verify
  const handleOtpSubmit = async (otp) => {
    setOtpVerifying(true);
    setOtpError("");
    try {
      const response = await api.post("/share/verify-otp", {
        token,
        otp,
      });
      const { accessToken: shareAccessToken } = response.data.data;
      setAccessToken(shareAccessToken);

      // ✅ fetch blob immediately after getting access token
      const fileRes = await fetch(`http://localhost:8080/share/view/${token}`, {
        headers: { Authorization: `Bearer ${shareAccessToken}` },
      });
      const blob = await fileRes.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(blobUrl); // ← use this as previewUrl
      setOtpModalOpen(false);
      setAccessGranted(true);
      showToast("Access granted!");
    } catch (error) {
      setOtpError(error.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setOtpResending(true);
    try {
      await api.post("/share/request-otp", {
        token,
      });
      showToast("New OTP sent!");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to resend OTP",
        "error",
      );
    } finally {
      setOtpResending(false);
    }
  };

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
      {/* Modals */}
      <OtpModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onSend={handleSendOtp}
        onSubmit={handleOtpSubmit}
        onSendOtp={handleSendOtp}
        onResend={handleResend}
        isSending={otpSending}
        isLoading={otpVerifying}
        isSending={otpSending}
        isResending={otpResending}
        email={fileData?.recipientEmail || fileData?.sharedByEmail}
        error={otpError}
      />

      {/* Background glows */}
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

          {/* Only show preview after access is granted */}
          {accessGranted && (
            <div className="w-full" style={{ maxWidth: 680 }}>
              <FilePreviewCard
                fileName={fileData.fileName}
                fileType={fileData.fileName?.split(".").pop()}
                expiryDate={fileData.expiresAt}
                previewUrl={
                  fileData.requiresOtp
                    ? previewBlobUrl // ← blob URL for restricted
                    : fileData.viewUrl // ← direct URL for public
                }
                onDownload={() => {
                  if (fileData.requiresOtp) {
                    // use previewBlobUrl for download too
                    const a = document.createElement("a");
                    a.href = previewBlobUrl;
                    a.download = fileData.fileName;
                    a.click();
                    showToast("Download started!");
                  } else {
                    window.open(fileData.downloadUrl, "_blank");
                    showToast("Download started!");
                  }
                }}
                onPreview={() => {
                  if (fileData.requiresOtp) {
                    window.open(previewBlobUrl, "_blank"); // ← open blob directly
                  } else {
                    window.open(fileData.viewUrl, "_blank");
                  }
                  showToast("Opening preview...");
                }}
                onCopy={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("Link copied!");
                }}
              />
            </div>
          )}

          {/* Blur placeholder while waiting for access */}
          {!accessGranted && (
            <div
              className="w-full rounded-2xl flex items-center justify-center"
              style={{
                maxWidth: 680,
                height: 300,
                background: "#13131f",
                border: "0.5px solid #2a2a3d",
              }}
            >
              <div className="text-center">
                <span className="material-symbols-outlined text-violet-400 text-4xl">
                  lock
                </span>
                <p className="text-slate-500 text-sm mt-2">
                  Verify your identity to view this file
                </p>
              </div>
            </div>
          )}
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
