"use client";
import { useState, useRef, useEffect } from "react";
import AuditDashboard from "@/components/AuditDashboard";
import HistoryPanel from "@/components/HistoryPanel";
import FollowUpChat from "@/components/FollowUpChat";

const SAMPLE_PROCESS = `Our trade settlement process begins when traders execute equity trades on the front-office system. Trade confirmations are sent manually via email to the back-office team who then re-enter trade data into the settlement system. The back-office team performs end-of-day reconciliation by comparing the front-office blotter with settlement records in a spreadsheet. Fails are flagged verbally to the relevant trader. There is no automated matching engine. The same individual who enters the trade also confirms and authorizes the settlement. Access controls to the settlement system are managed by the individual team leads without central oversight. We process approximately $2B in daily settlements across 15 markets.`;

export default function Home() {
  const [process, setProcess] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const analyze = async () => {
    if (!process.trim() || process.trim().length < 20) {
      setError("Please describe the process in at least 20 characters.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ process }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Analysis failed");
      setResult(json.data);
      // Refresh history
      fetchHistory();
    } catch (e) {
      setError(e.message || "Something went wrong. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      const json = await res.json();
      if (json.success) setHistory(json.data);
    } catch (_) {}
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleTextChange = (e) => {
    setProcess(e.target.value);
    setCharCount(e.target.value.length);
  };

  const loadSample = () => {
    setProcess(SAMPLE_PROCESS);
    setCharCount(SAMPLE_PROCESS.length);
  };

  return (
    <main className="min-h-screen bg-[#080c14] text-white font-['IBM_Plex_Mono',monospace]">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-sm">⬡</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-wider">AUDIT AI COPILOT</h1>
              <p className="text-[10px] text-white/30 tracking-widest">INTERNAL AUDIT · RISK INTELLIGENCE</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[11px] text-white/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GPT-4o-mini · Live
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-[11px] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-md transition-all"
            >
              {showHistory ? "← Close" : "History →"}
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Hero */}
            {!result && !loading && (
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 text-[10px] text-emerald-400/70 border border-emerald-500/20 rounded-full px-3 py-1 mb-6 tracking-widest">
                  <span>◈</span> POWERED BY ADVANCED AUDIT INTELLIGENCE
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                  Identify Risks.<br />
                  <span className="text-emerald-400">Instantly.</span>
                </h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-xl">
                  Enterprise-grade internal audit intelligence. Describe any business process and receive a structured risk assessment modeled on Big 4 audit methodology.
                </p>
              </div>
            )}

            {/* Input section */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 mb-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] text-white/40 tracking-widest font-medium">PROCESS DESCRIPTION</label>
                <button
                  onClick={loadSample}
                  className="text-[10px] text-emerald-400/60 hover:text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 px-2.5 py-1 rounded transition-all"
                >
                  Load sample →
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={process}
                onChange={handleTextChange}
                placeholder="Describe the business process you want audited. Include: stakeholders involved, systems used, manual vs automated steps, approval flows, data flows, volumes, and any known control points..."
                className="w-full bg-transparent text-white/80 text-sm placeholder:text-white/15 resize-none outline-none leading-relaxed min-h-[160px]"
                rows={8}
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className="text-[10px] text-white/20">{charCount} / 5000 characters</span>
                <button
                  onClick={analyze}
                  disabled={loading}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold px-6 py-2.5 rounded-lg transition-all duration-200 tracking-wider"
                >
                  {loading ? (
                    <>
                      <span className="w-3 h-3 border border-black/40 border-t-black rounded-full animate-spin" />
                      ANALYZING...
                    </>
                  ) : (
                    <> ◈ RUN AUDIT ANALYSIS</>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm">
                ⚠ {error}
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-ping" />
                    <div className="absolute inset-2 border border-emerald-500/50 rounded-full animate-spin" style={{animationDuration:'2s'}} />
                    <div className="absolute inset-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <span className="text-emerald-400 text-lg">⬡</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium mb-1">Analyzing risks & control gaps...</p>
                    <p className="text-white/30 text-xs">Applying Basel · SOX · COSO · ISO 31000 frameworks</p>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {["Parsing process","Identifying risks","Mapping controls","Generating report"].map((step, i) => (
                      <div key={step} className="flex items-center gap-1">
                        <span className="text-[9px] text-white/20 animate-pulse" style={{animationDelay:`${i*0.5}s`}}>{step}</span>
                        {i < 3 && <span className="text-white/10 text-[9px]">›</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <AuditDashboard
                result={result}
                process={process}
                apiBase={API_BASE}
              />
            )}

            {/* Follow-up chat */}
            {result && !loading && (
              <FollowUpChat
                process={process}
                result={result}
                apiBase={API_BASE}
              />
            )}
          </div>

          {/* History sidebar */}
          {showHistory && (
            <div className="w-72 shrink-0">
              <HistoryPanel
                history={history}
                apiBase={API_BASE}
                onLoad={(entry) => {
                  setResult(entry.result);
                  setProcess(entry.process_snippet);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
