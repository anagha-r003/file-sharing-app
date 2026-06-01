function FileTableStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
      {[
        {
          label: "DOCUMENTS",
          value: stats.documents,
          icon: "description",
          color: "text-blue-400 bg-blue-400/10",
        },
        {
          label: "IMAGES",
          value: stats.images,
          icon: "image",
          color: "text-green-400 bg-green-400/10",
        },
        {
          label: "VIDEOS",
          value: stats.videos,
          icon: "videocam",
          color: "text-yellow-400 bg-yellow-400/10",
        },
        {
          label: "OTHERS",
          value: stats.others,
          icon: "folder_zip",
          color: "text-violet-400 bg-violet-400/10",
        },
      ].map((card) => (
        <div key={card.label} className="custom-card p-4 md:p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {card.label}
            </span>
            <div
              className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center ${card.color}`}
            >
              <span className="material-symbols-outlined text-base md:text-lg">
                {card.icon}
              </span>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FileTableStats;