import { Clock } from "lucide-react"; 

const LinkExpired = () => {
  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center p-6 text-white">
      {/* Main Card */}
      <div className="max-w-md w-full bg-[#18181b] border border-[#27272a] rounded-2xl p-8 text-center shadow-2xl">
        {/* Icon Header */}
        <div className="mx-auto w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-8">
          <Clock className="w-10 h-10 text-red-500" />
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-bold tracking-tight mb-4">Link Expired</h1>
        <p className="text-zinc-400 leading-relaxed mb-10">
          This secure link is no longer active.
          
        </p>


        {/* Footer Branding */}
        <div className="mt-8 pt-8 border-t border-[#27272a]">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            VaultLink Security System
          </span>
        </div>
      </div>
    </div>
  );
};

export default LinkExpired;
