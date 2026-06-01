import { ShieldOff, Info } from "lucide-react";

const AccessRevoked = () => {
  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-[#18181b] border border-[#27272a] rounded-2xl p-8 text-center shadow-2xl">

        {/* Icon Header */}
        <div className="mx-auto w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-8">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-bold tracking-tight mb-4">Access Revoked</h1>
        <p className="text-zinc-400 leading-relaxed mb-6">
          The owner has revoked access to this link. You no longer have permission to view this content.
        </p>

        {/* Info Box */}
        <div className="flex items-start gap-3 text-left bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 mb-8">
          <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300/80 text-xs leading-relaxed">
            If you believe this is a mistake, please contact the person who shared this link with you.
          </p>
        </div>

        {/* Footer Branding */}
        <div className="pt-8 border-t border-[#27272a]">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            VaultLink Security System
          </span>
        </div>

      </div>
    </div>
  );
};

export default AccessRevoked;