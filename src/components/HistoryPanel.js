"use client";
import { useState } from "react";

const SEV_COLOR = {
  High: "text-red-400 border-red-500/30",
  Medium: "text-amber-400 border-amber-500/30",
  Low: "text-blue-400 border-blue-500/30",
};

export default function HistoryPanel({ history, apiBase, onLoad }) {
  const [loading, setLoading] = useState(null);

  const loadAnalysis = async (id) => {
    setLoading(id);
    try {
      const res = await fetch(`${apiBase}/history/${id}`);
      const json = await res.json();
      if (json.success) {
        onLoad(json.data);
      }
    } catch (_) {} finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-white/20" />
        <span className="text-[11px] text-white/40 tracking-widest">HISTORY</span>
        <span className="text-[10px] text-white/20 ml-auto">{history.length} analyses</span>
      </div>

      {history.length === 0 ? (
        <p className="text-white/20 text-xs text-center py-8">No previous analyses yet</p>
      ) : (
        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => loadAnalysis(item.id)}
              disabled={loading === item.id}
              className="w-full text-left bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className={`text-[9px] border rounded px-1.5 py-0.5 tracking-wider ${SEV_COLOR[item.overall_severity] || "text-white/40 border-white/10"}`}>
                  {item.overall_severity?.toUpperCase()}
                </span>
                <span className="text-[9px] text-white/20">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-white/50 text-[11px] leading-relaxed line-clamp-3 group-hover:text-white/70 transition-colors">
                {item.process_snippet}
              </p>
              {loading === item.id && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <span className="text-[10px] text-white/30">Loading...</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
