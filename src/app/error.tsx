"use client";
import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[NutriPlan error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-900/40 border border-red-700 flex items-center justify-center mx-auto">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
        <pre className="text-xs text-red-300 bg-slate-800 border border-slate-700 rounded-xl p-4 text-left overflow-auto whitespace-pre-wrap break-all">
          {error.message}
        </pre>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold transition-colors"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    </div>
  );
}
