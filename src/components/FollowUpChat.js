"use client";
import { useState } from "react";

export default function FollowUpChat({ process, result, apiBase }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const askQuestion = async () => {
    if (!question.trim()) return;
    const q = question;
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ process, previous_analysis: result, question: q }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed");
      setHistory(prev => [...prev, { q, a: json.answer }]);
    } catch (e) {
      setHistory(prev => [...prev, { q, a: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-violet-400" />
        <span className="text-[11px] text-white/40 tracking-widest">FOLLOW-UP QUESTIONS</span>
        <span className="text-[10px] text-white/20 ml-auto">Ask the AI auditor anything about this assessment</span>
      </div>

      {history.length > 0 && (
        <div className="space-y-4 mb-5 max-h-80 overflow-y-auto">
          {history.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex gap-3">
                <span className="text-[10px] text-violet-400/60 shrink-0 mt-0.5 tracking-wider">YOU</span>
                <p className="text-white/70 text-sm">{item.q}</p>
              </div>
              <div className="flex gap-3 pl-0">
                <span className="text-[10px] text-emerald-400/60 shrink-0 mt-0.5 tracking-wider">AI</span>
                <p className="text-white/50 text-xs leading-relaxed border-l border-emerald-500/20 pl-3">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 items-end">
        <div className="flex-1 bg-black/30 border border-white/8 rounded-xl px-4 py-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKey}
            placeholder="e.g. What's the estimated regulatory fine exposure? Which risk should be remediated first?"
            className="w-full bg-transparent text-white/75 text-sm placeholder:text-white/15 resize-none outline-none leading-relaxed"
            rows={2}
          />
        </div>
        <button
          onClick={askQuestion}
          disabled={loading || !question.trim()}
          className="flex items-center gap-2 border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs px-4 py-3 rounded-xl transition-all h-full"
        >
          {loading ? (
            <span className="w-3 h-3 border border-violet-400/40 border-t-violet-400 rounded-full animate-spin" />
          ) : (
            "↵ Ask"
          )}
        </button>
      </div>
      <p className="text-[10px] text-white/15 mt-2">Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
