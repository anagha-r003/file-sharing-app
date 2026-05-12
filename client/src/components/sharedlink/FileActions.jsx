export default function FileActions({ onDownload, onPreview, onCopy }) {
  return (
    <div className="flex flex-col gap-3 p-5 md:p-6">
      <button
        type="button"
        onClick={onDownload}
        className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500"
      >
        Download file
      </button>
      <button
        type="button"
        onClick={onPreview}
        className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700"
      >
        Open preview
      </button>
      <button
        type="button"
        onClick={onCopy}
        className="w-full rounded-xl bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
      >
        Copy link
      </button>
    </div>
  );
}
