import { useEffect, useState } from "react";
import SharedLinksTable from "../../components/sharedlink/ShareLinksTable";
import { getMySharedFiles } from "../../services/shareService";
import { usePageSettings } from "../../context/LayoutContext";
import Toast from "../../components/sharedlink/Toast";

function SharedLinksPage() {
  const [sharedLinks, setSharedLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(0);

  const [totalItems, setTotalItems] = useState(0);

  const PAGE_SIZE = 10;

  usePageSettings({ title: "Shared Links" });

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchSharedLinks();
  }, [page]);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const fetchSharedLinks = async () => {
    try {
      setLoading(true);
      const response = await getMySharedFiles(page - 1, PAGE_SIZE);

      const pageData = response.data;

      setTotalPages(pageData.totalPages || 0);

      setTotalItems(pageData.totalElements || 0);

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
        accessed: item.accessed,
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
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
      />
    </>
  );
}

export default SharedLinksPage;
