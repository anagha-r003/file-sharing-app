import React from "react";
import { Clock, ArrowLeft } from "lucide-react"; // Using Lucide icons for a clean look

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
          {/* For your protection, VaultLink 
          automatically revokes access tokens after a period of inactivity. */}
        </p>

        {/* Primary Action */}
        {/* <button
          onClick={() => (window.location.href = "/dashboard")}
          className="w-full bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          Return to Dashboard
        </button> */}

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
