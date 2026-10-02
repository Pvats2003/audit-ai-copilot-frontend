"use client";
import { useState, useRef, useEffect } from "react";
import AuditDashboard from "@/components/AuditDashboard";
import HistoryPanel from "@/components/HistoryPanel";
import FollowUpChat from "@/components/FollowUpChat";

const SAMPLE_PROCESS = `Our trade settlement process begins when traders execute equity trades on the front-office system. Trade confirmations are sent manually via email to the back-office team who then re-enter trade data into the settlement system. The back-office team performs end-of-day reconciliation by comparing the front-office blotter with settlement records in a spreadsheet. Fails are flagged verbally to the relevant trader. There is no automated matching engine. The same individual who enters the trade also confirms and authorizes the settlement. Access controls to the settlement system are managed by the individual team leads without central oversight. We process approximately $2B in daily settlements across 15 markets.`;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [processText, setProcessText]   = useState("");
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState("");
  const [history, setHistory]           = useState([]);
  const [showHistory, setShowHistory]   = useState(false);
  const [inputMode, setInputMode]       = useState("text"); // "text" | "file"
  const [uploadedFile, setUploadedFile] = useState(null);
  const [exporting, setExporting]       = useState(false);
  const fileRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      const json = await res.json();
      if (json.success) setHistory(json.data);
    } catch (_) {}
  };

  useEffect(() => { fetchHistory(); }, []);

  const runAnalysis = async () => {
    setError("");
    setLoading(true);
    setResult(null);

    try {
      let res, json;

      if (inputMode === "file" && uploadedFile) {
        const form = new FormData();
        form.append("file", uploadedFile);
        res  = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
        json = await res.json();
        if (!res.ok) throw new Error(json.detail || "Upload failed");
        setProcessText(`[Extracted from: ${uploadedFile.name}]`);
      } else {
        if (!processText.trim() || processText.trim().length < 20) {
          setError("Please describe the process in at least 20 characters.");
          setLoading(false);
          return;
        }
        res  = await fetch(`${API_BASE}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ process: processText }),
        });
        json = await res.json();
        if (!res.ok) throw new Error(json.detail || "Analysis failed");
      }

      setResult(json.data);
      setAnalysisId(json.analysis_id);
      fetchHistory();
    } catch (e) {
      setError(e.message || "Something went wrong. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const [analysisId, setAnalysisId] = useState(null);

  const exportPDF = async () => {
    if (!analysisId) return;
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/report/${analysisId}`);
      if (!res.ok) throw new Error("PDF export failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `audit_report_${analysisId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setUploadedFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) { setUploadedFile(f); setInputMode("file"); }
  };

  return (
    <main className="min-h-screen bg-[#080c14] text-white font-['IBM_Plex_Mono',monospace]">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm">⬡</div>
            <div>
              <h1 className="text-sm font-semibold tracking-wider">AUDIT AI COPILOT</h1>
              <p className="text-[10px] text-white/30 tracking-widest">INTERNAL AUDIT · RISK INTELLIGENCE · v3</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[11px] text-white/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Rule Engine + GPT-4o-mini
            </div>
            {result && (
              <button
                onClick={exportPDF}
                disabled={exporting}
                className="text-[11px] text-emerald-400/70 hover:text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 px-3 py-1.5 rounded-md transition-all disabled:opacity-40"
              >
                {exporting ? "Generating..." : "⬇ Export PDF"}
              </button>
            )}
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
          <div className="flex-1 min-w-0">
            {/* Hero */}
            {!result && !loading && (
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 text-[10px] text-emerald-400/70 border border-emerald-500/20 rounded-full px-3 py-1 mb-6 tracking-widest">
                  <span>◈</span> 10-RULE ENGINE + LLM ENHANCEMENT
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                  Audit Any Process.<br /><span className="text-emerald-400">Instantly.</span>
                </h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-xl">
                  Paste a process description or upload a PDF/DOCX. Get a structured risk assessment with findings mapped to SOX, Basel III, MiFID II, and ISO 31000.
                </p>
              </div>
            )}

            {/* Input mode toggle */}
            <div className="flex gap-2 mb-4">
              {["text", "file"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className={`text-[11px] px-4 py-2 rounded-lg border transition-all tracking-wider ${
                    inputMode === mode
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "border-white/8 text-white/30 hover:text-white/50"
                  }`}
                >
                  {mode === "text" ? "✎ Text Input" : "⬆ File Upload"}
                </button>
              ))}
            </div>

            {/* Input box */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 mb-6 backdrop-blur-sm">
              {inputMode === "text" ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] text-white/40 tracking-widest">PROCESS DESCRIPTION</span>
                    <button onClick={() => setProcessText(SAMPLE_PROCESS)} className="text-[10px] text-emerald-400/60 hover:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded transition-all">
                      Load sample →
                    </button>
                  </div>
                  <textarea
                    value={processText}
                    onChange={(e) => setProcessText(e.target.value)}
                    placeholder="Describe the business process to audit. Include stakeholders, systems, manual steps, approval flows, and volumes..."
                    className="w-full bg-transparent text-white/80 text-sm placeholder:text-white/15 resize-none outline-none leading-relaxed min-h-[140px]"
                    rows={7}
                  />
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <span className="text-[10px] text-white/20">{processText.length} / 5000</span>
                    <button onClick={runAnalysis} disabled={loading} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black text-xs font-bold px-6 py-2.5 rounded-lg transition-all tracking-wider">
                      {loading ? <><span className="w-3 h-3 border border-black/40 border-t-black rounded-full animate-spin" />ANALYZING...</> : "◈ RUN AUDIT ANALYSIS"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-[11px] text-white/40 tracking-widest block mb-4">UPLOAD DOCUMENT</span>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-white/10 hover:border-emerald-500/30 rounded-xl p-10 text-center cursor-pointer transition-all group"
                  >
                    <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} className="hidden" />
                    {uploadedFile ? (
                      <div>
                        <p className="text-emerald-400 text-sm font-medium mb-1">✓ {uploadedFile.name}</p>
                        <p className="text-white/30 text-xs">{(uploadedFile.size / 1024).toFixed(1)} KB · Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white/30 text-2xl mb-3 group-hover:text-white/50 transition-colors">⬆</p>
                        <p className="text-white/50 text-sm mb-1">Drop a file or click to browse</p>
                        <p className="text-white/20 text-xs">Supports PDF, DOCX, TXT · Max 5000 chars extracted</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                    <button onClick={runAnalysis} disabled={loading || !uploadedFile} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black text-xs font-bold px-6 py-2.5 rounded-lg transition-all tracking-wider">
                      {loading ? <><span className="w-3 h-3 border border-black/40 border-t-black rounded-full animate-spin" />ANALYZING...</> : "◈ ANALYZE DOCUMENT"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm">⚠ {error}</div>
            )}

            {loading && (
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-ping" />
                    <div className="absolute inset-2 border border-emerald-500/50 rounded-full animate-spin" style={{animationDuration:'2s'}} />
                    <div className="absolute inset-4 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-lg">⬡</div>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium mb-1">Running audit engine...</p>
                    <p className="text-white/30 text-xs">10 rules · 5 domains · LLM enhancement</p>
                  </div>
                </div>
              </div>
            )}

            {result && !loading && (
              <>
                <AuditDashboard result={result} process={processText} apiBase={API_BASE} onExportPDF={exportPDF} exporting={exporting} />
                <FollowUpChat process={processText} result={result} apiBase={API_BASE} />
              </>
            )}
          </div>

          {showHistory && (
            <div className="w-72 shrink-0">
              <HistoryPanel history={history} apiBase={API_BASE} onLoad={(entry) => { setResult(entry.result); }} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
