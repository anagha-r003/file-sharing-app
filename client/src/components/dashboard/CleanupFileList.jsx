import { Trash2, Files, Copy, HardDrive } from "lucide-react";
import { useMemo, useState } from "react";
import { getFileMeta, formatSize, formatDate } from "../../utils/fileUtils";

function Checkbox({ checked, onToggle }) {
  return (
    <div
      className="cursor-pointer shrink-0"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
          checked
            ? "bg-violet-600 border-violet-600"
            : "border-[#1a1a28] bg-transparent hover:border-violet-500/50"
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

function FileRow({ file, isSelected, onToggle, onDelete }) {
  const meta = getFileMeta(file.name);

  return (
    <>
      <div
        className={`hidden md:grid grid-cols-[32px_1fr_90px_110px_44px] items-center gap-3 px-4 py-3.5 transition ${
          isSelected ? "bg-violet-600/10" : "hover:bg-white/[0.02]"
        }`}
      >
        <Checkbox checked={isSelected} onToggle={onToggle} />
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}
          >
            <span className="material-symbols-outlined text-base">
              {meta.icon}
            </span>
          </div>
          <p className="text-[13px] text-white truncate">{file.name}</p>
        </div>
        <p className="text-[13px] text-[#44446a]">{formatSize(file.size)}</p>
        <p className="text-[13px] text-[#44446a]">
          {formatDate(file.uploadedAt)}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file);
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#44446a] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition ml-auto"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div
        className={`md:hidden flex items-start gap-3 px-4 py-3.5 border-b border-[#1a1a28] transition ${
          isSelected ? "bg-violet-600/10" : ""
        }`}
      >
        <Checkbox checked={isSelected} onToggle={onToggle} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}
            >
              <span className="material-symbols-outlined text-base">
                {meta.icon}
              </span>
            </div>
            <p className="text-[13px] font-medium text-white truncate">
              {file.name}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2 pl-[42px]">
            <div className="text-[11px] text-[#44446a]">
              {formatSize(file.size)} · {formatDate(file.uploadedAt)}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#44446a] hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="py-12 px-4 text-center">
      <div className="w-11 h-11 rounded-xl bg-[#6366f115] border border-[#6366f122] flex items-center justify-center mx-auto mb-3">
        <Icon size={18} className="text-[#6366f1]" />
      </div>
      <p
        className="text-[13px] font-bold text-white mb-1"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {title}
      </p>
      <p className="text-[12px] text-[#44446a]">{description}</p>
    </div>
  );
}

export default function CleanupFileList({
  largestFiles = [],
  duplicateGroups = [],
  selectedIds,
  onToggleSelect,
  onDeleteFile,
}) {
  const [activeTab, setActiveTab] = useState("largest");

  const duplicateFileIds = new Set(
    duplicateGroups.flatMap((group) => group.files.map((file) => file.id)),
  );
  const filteredLargestFiles = useMemo(
    () => largestFiles.filter((file) => !duplicateFileIds.has(file.id)),
    [largestFiles, duplicateGroups],
  );

  const hasLargest = filteredLargestFiles.length > 0;
  const hasDuplicates = duplicateGroups.length > 0;
  const duplicateCount = duplicateGroups.reduce(
    (sum, g) => sum + g.files.length,
    0,
  );

  if (!hasLargest && !hasDuplicates) {
    return (
      <EmptyState
        icon={HardDrive}
        title="Storage looks good"
        description="No large or duplicate files need cleanup right now."
      />
    );
  }

  const tabs = [
    {
      id: "largest",
      label: "Largest Files",
      count: filteredLargestFiles.length,
      icon: Files,
    },
    {
      id: "duplicates",
      label: "Duplicates",
      count: duplicateGroups.length,
      icon: Copy,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#0f0f17] border border-[#1a1a28] rounded-[14px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-violet-600 hover:bg-violet-500 text-white"
                  : "text-[#44446a] hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span className="truncate">{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#1a1a28] text-[#44446a]"
                }`}
              >
                {tab.id === "duplicates" ? duplicateCount : tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === "largest" ? (
        <section>
          <div className="bg-[#0f0f17] border border-[#1a1a28] rounded-[14px] overflow-hidden hover:border-[#6366f1]/30 transition">
            {hasLargest ? (
              <>
                <div className="hidden md:grid grid-cols-[32px_1fr_90px_110px_44px] gap-3 px-4 py-3 bg-[#0a0a10] border-b border-[#1a1a28] text-[10px] font-semibold tracking-widest text-[#44446a] uppercase">
                  <div />
                  <div>Name</div>
                  <div>Size</div>
                  <div>Uploaded</div>
                  <div />
                </div>
                {filteredLargestFiles.map((file, idx) => (
                  <div
                    key={file.id}
                    className={
                      idx !== filteredLargestFiles.length - 1
                        ? "border-b border-[#1a1a28] md:border-[#1a1a28]"
                        : ""
                    }
                  >
                    <FileRow
                      file={file}
                      isSelected={selectedIds.includes(file.id)}
                      onToggle={() => onToggleSelect(file.id)}
                      onDelete={onDeleteFile}
                    />
                  </div>
                ))}
              </>
            ) : (
              <EmptyState
                icon={Files}
                title="No large files"
                description="Your largest files are already optimized."
              />
            )}
          </div>
        </section>
      ) : (
        <section>
          {hasDuplicates ? (
            <div className="space-y-3">
              {duplicateGroups.map((group) => (
                <div
                  key={`${group.name}-${group.size}`}
                  className="bg-[#0f0f17] border border-[#1a1a28] rounded-[14px] overflow-hidden hover:border-[#6366f1]/30 transition"
                >
                  <div className="px-4 py-3 bg-[#6366f1]/8 border-b border-[#6366f1]/15 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">
                        {group.name}
                      </p>
                      <p className="text-[11px] text-[#44446a] mt-0.5">
                        {formatSize(group.size)} · {group.files.length} copies
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-[#6366f1] bg-[#6366f115] border border-[#6366f122] px-2 py-1 rounded-full uppercase tracking-wide shrink-0">
                      Duplicate
                    </span>
                  </div>
                  <div className="hidden md:grid grid-cols-[32px_1fr_90px_110px_44px] gap-3 px-4 py-2.5 bg-[#0a0a10] border-b border-[#1a1a28] text-[10px] font-semibold tracking-widest text-[#44446a] uppercase">
                    <div />
                    <div>Name</div>
                    <div>Size</div>
                    <div>Uploaded</div>
                    <div />
                  </div>
                  {group.files.map((file, idx) => (
                    <div
                      key={file.id}
                      className={
                        idx !== group.files.length - 1
                          ? "border-b border-[#1a1a28]"
                          : ""
                      }
                    >
                      <FileRow
                        file={file}
                        isSelected={selectedIds.includes(file.id)}
                        onToggle={() => onToggleSelect(file.id)}
                        onDelete={onDeleteFile}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0f0f17] border border-[#1a1a28] rounded-[14px]">
              <EmptyState
                icon={Copy}
                title="No duplicates found"
                description="Files with the same name and size will appear here."
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
