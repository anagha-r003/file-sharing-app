import { useEffect, useState } from "react";
import SharedLinksTable from "../../components/sharedlink/ShareLinksTable";
import { getMySharedFiles } from "../../services/shareService";
import { usePageSettings } from "../../context/LayoutContext";
import Toast from "../../components/sharedlink/Toast";

function SharedLinksPage() {
  const [sharedLinks, setSharedLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  usePageSettings({ title: "Shared Links" });

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });



  useEffect(() => {
    fetchSharedLinks();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const fetchSharedLinks = async () => {
    try {
      setLoading(true);
      const response = await getMySharedFiles();

      // response.data is the ResponseStructure wrapper
      // response.data.data is the Page object
      const pageData = response.data;
      const items = pageData.content ?? [];

      const formattedData = items.map((item) => ({
        id: item.id,
        fileName: item.fileName, // already mapped in service layer
        fileId: item.fileId,
        recipientEmail: item.recipientEmail,
        expiryDate: item.expiresAt,
        active: item.active,
        downloadCount: item.downloadCount,
        shareUrl: item.shareUrl, // backend builds this
        status: item.status,
      }));

      setSharedLinks(formattedData);
    } catch (error) {
      console.error("Failed to fetch shared links", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSharedLinks();
  };

  return (
    <>
          <div className="max-w-[1400px] mx-auto">
            {/* Search bar container has been removed from here.
                Design now flows directly into the content table.
            */}

            {loading ? (
              <div className="p-16 text-center text-slate-500">
                <div className="animate-pulse font-medium">
                  Loading shared links...
                </div>
              </div>
            ) : (
              <SharedLinksTable
                sharedLinks={sharedLinks}
                onRefresh={handleRefresh}
                showToast={showToast}
              />
            )}
          </div>
     <Toast message={toast.message} visible={toast.visible} type={toast.type} />
    </>
  );
}

export default SharedLinksPage;
