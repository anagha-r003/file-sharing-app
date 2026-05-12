import { useState } from "react";
import { createShareLink } from "../../../services/shareService";
import ShareModalHeader from "./ShareModalHeader";
import EmailInput from "./EmailInput";
import AccessSettings from "./AccessSettings";
import GeneratedLinkDisplay from "./GeneratedLinkDisplay";
import ShareModalActions from "./ShareModalActions";

function ShareModal({ file, onClose }) {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [expiryDate, setExpiryDate] = useState(
    tomorrow.toISOString().slice(0, 16),
  );
  const [access, setAccess] = useState("anyone");

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 3000);
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = email.trim().replace(",", "");
      if (val && !emails.includes(val)) {
        setEmails((prev) => [...prev, val]);
      }
      setEmail("");
    }
  };

  const removeEmail = (em) => {
    setEmails((prev) => prev.filter((e) => e !== em));
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const requestBody = {
        fileId: file.id,
        recipientEmails: emails,
        message: message,
        expiresAt: expiryDate,
        accessType: access === "anyone" ? "ANYONE" : "RESTRICTED",
      };

      const response = await createShareLink(requestBody);
      const generatedLink = response?.data?.[0]?.shareUrl;
      setLink(generatedLink);
      return generatedLink;
    } catch (err) {
      console.error(err);
      showToast("Failed to create sharelink");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    let finalLink = link;
    if (!finalLink) {
      finalLink = await handleGenerateLink();
    }
    if (!finalLink) return;
    navigator.clipboard.writeText(finalLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (emails.length === 0) {
      showToast("Add atleast one email");
      return;
    }

    const finalLink = await handleGenerateLink();
    if (!finalLink) return;

    showToast("Share link created and emails sent!");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1e1e1e] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <ShareModalHeader fileName={file.name} onClose={onClose} />

        {/* Body */}
        <div className="px-6 pb-6 space-y-5 overflow-y-auto">
          <EmailInput
            emails={emails}
            email={email}
            onEmailChange={(e) => setEmail(e.target.value)}
            onEmailKeyDown={handleEmailKeyDown}
            onRemoveEmail={removeEmail}
          />

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message..."
            rows={3}
            className="w-full bg-white/[0.02] border border-white/10 rounded-xl text-white text-sm px-4 py-3 outline-none focus:border-white/20 focus:bg-white/[0.04] transition placeholder:text-slate-600 resize-none"
          />

          <AccessSettings
            access={access}
            onAccessChange={(e) => setAccess(e.target.value)}
            expiryDate={expiryDate}
            onExpiryDateChange={(e) => setExpiryDate(e.target.value)}
          />

          <GeneratedLinkDisplay
            link={link}
            copied={copied}
            onCopy={handleCopy}
          />

          <ShareModalActions
            link={link}
            emails={emails}
            loading={loading}
            onGenerateLink={handleGenerateLink}
            onClose={onClose}
            onSend={handleSend}
            toast={toast}
          />
        </div>
      </div>
    </div>
  );
}

export default ShareModal;