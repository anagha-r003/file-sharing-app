import { X, Folder, FolderPlus, Check } from "lucide-react";
import { useState, useEffect } from "react";
import CreateFolderModal from "./CreateFolderModal";
import SearchInput from "../../common/ui/SearchInput";
import { getFolders, addFilesToFolder } from "../../services/folderService";
import Toast from "../sharedlink/Toast";

export default function AddToFolderModal({ files, onClose }) {
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const filtered = folders.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase()),
  );

  const fetchFolders = async () => {
    try {
      const response = await getFolders();

      setFolders(response.data || []);
    } catch (err) {
      console.error("Failed to fetch folders", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({
      visible: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        visible: false,
      }));
    }, 2500);
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-[430px] rounded-2xl border border-white/[0.09] bg-[#1a1a2a] shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-[18px] pb-[14px]">
            <div>
              <h2 className="text-[15px] font-semibold text-[#e8e8f0] mb-0.5">
                Add to folder
              </h2>
              <p className="text-[12px] text-white/30 truncate max-w-[320px]">
                {files.length === 1
                  ? files[0]?.name
                  : `${files.length} files selected`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/35 hover:text-white/70 transition mt-0.5"
            >
              <X size={15} />
            </button>
          </div>

          <div className="h-px bg-white/[0.07]" />

          {/* Search — reusing your SearchInput */}
          <div className="px-2.5 pt-3 pb-1">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery("")}
              placeholder="Search folders…"
            />
          </div>

          {/* Folder list */}
          <div className="px-2.5 py-1.5 flex flex-col max-h-56 overflow-y-auto">
            {loading ? (
              <p className="text-center text-white/40 py-6">
                Loading folders...
              </p>
            ) : filtered.length > 0 ? (
              filtered.map((folder) => (
                <button
                  key={folder.id}
                  onClick={async () => {
                    try {
                      setSelectedId(folder.id);

                      await addFilesToFolder(
                        folder.id,
                        files.map((file) => file.id),
                      );

                      showToast(
                        files.length === 1
                          ? `"${files[0].name}"
       added to
       "${folder.name}"`
                          : `${files.length}
       files added to
       "${folder.name}"`,
                      );

                      setTimeout(() => {
                        onClose();
                      }, 800);
                    } catch (err) {
                      console.error("Failed to add file", err);

                      showToast(
                        err.response?.data?.message || "Failed to add file",
                        "error",
                      );
                    }
                  }}
                  className={`flex items-center gap-3.5 w-full px-3 py-[10px] rounded-xl text-left transition-colors
                    ${selectedId === folder.id ? "bg-white/[0.07]" : "hover:bg-white/[0.05]"}`}
                >
                  <div
                    className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl`}
                    style={{
                      backgroundColor: `${folder.color}20`,
                    }}
                  >
                    <Folder
                      size={20}
                      style={{
                        color: folder.color,
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#dddde8] leading-tight mb-0">
                      {folder.name}
                    </p>
                    <p className="text-[11px] text-white/30 mt-0">
                      {folder.filesCount}{" "}
                      {folder.filesCount === 1 ? "file" : "files"}
                    </p>
                  </div>
                  <Check
                    size={15}
                    className={`flex-shrink-0 transition-opacity
    ${selectedId === folder.id ? "opacity-100" : "opacity-0"}`}
                    style={{
                      color: folder.color,
                    }}
                  />
                </button>
              ))
            ) : (
              <p className="text-[13px] text-white/25 text-center py-6">
                No folders match "{query}"
              </p>
            )}
          </div>

          <div className="h-px bg-white/[0.07]" />

          {/* Create new folder */}
          <div className="px-2.5 py-2.5">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-white/[0.14] hover:border-white/[0.28] text-white/45 hover:text-white/70 text-[13px] transition-all"
            >
              <FolderPlus size={16} />
              Create new folder
            </button>
          </div>
        </div>
      </div>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      {showCreate && (
        <CreateFolderModal
          file={files}
          onClose={onClose}
          onBack={() => setShowCreate(false)}
          onCreated={() => {
            fetchFolders();
            setShowCreate(false);
          }}
        />
      )}
    </>
  );
}
