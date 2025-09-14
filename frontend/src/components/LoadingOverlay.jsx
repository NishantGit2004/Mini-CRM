import React from "react";

export default function LoadingOverlay({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70">
      <div className="text-center p-6 bg-slate-800 rounded-xl border border-slate-700">
        <div className="w-14 h-14 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-sm">{message}</div>
      </div>
    </div>
  );
}