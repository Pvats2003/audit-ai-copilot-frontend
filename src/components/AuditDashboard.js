"use client";
import { useState } from "react";

const SEVERITY_CONFIG = {
  High: {
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
    dot: "bg-red-400",
    bar: "bg-red-500",
    glow: "shadow-red-500/10",
  },
  Medium: {
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
    bar: "bg-amber-500",
    glow: "shadow-amber-500/10",
  },
  Low: {
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
    bar: "bg-blue-500",
    glow: "shadow-blue-500/10",
  },
};

function SeverityBadge({ severity, size = "sm" }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Medium;
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider ${cfg.badge} ${size === 'lg' ? 'px-3 py-1 text-xs' : ''}`}>
      <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
      {severity?.toUpperCase()}
    </span>
  );
}

function RiskCard({ item, delay = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.Medium;

  return (
    <div
      className={`group bg-red-950/20 border border-red-500/15 hover:border-red-500/30 rounded-xl p-4 cursor-pointer transition-all duration-200 animate-fade-in-up shadow-lg ${cfg.glow}`}
      style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-red-500/50 text-xs font-mono shrink-0 mt-0.5">{item.id}</span>
          <p className="text-white/85 text-sm font-medium leading-snug">{item.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SeverityBadge severity={item.severity} />
          <span className="text-white/20 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && (
        <p className="mt-3 ml-7 text-white/50 text-xs leading-relaxed border-t border-red-500/10 pt-3">
          {item.description}
        </p>
      )}
    </div>
  );
}

function GapCard({ item, delay = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.Medium;

  return (
    <div
      className={`bg-amber-950/20 border border-amber-500/15 hover:border-amber-500/30 rounded-xl p-4 cursor-pointer transition-all duration-200 animate-fade-in-up shadow-lg ${cfg.glow}`}
      style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-amber-500/50 text-xs font-mono shrink-0 mt-0.5">{item.id}</span>
          <p className="text-white/85 text-sm font-medium leading-snug">{item.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SeverityBadge severity={item.severity} />
          <span className="text-white/20 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && (
        <p className="mt-3 ml-7 text-white/50 text-xs leading-relaxed border-t border-amber-500/10 pt-3">
          {item.description}
        </p>
      )}
    </div>
  );
}

function ControlCard({ item, delay = 0 }) {
  return (
    <div
      className="bg-emerald-950/20 border border-emerald-500/15 hover:border-emerald-500/30 rounded-xl p-4 transition-all duration-200 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-emerald-500/50 text-xs font-mono shrink-0 mt-0.5">{item.id}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-white/85 text-sm font-medium leading-snug">{item.title}</p>
            {item.framework && (
              <span className="text-[9px] text-emerald-400/60 border border-emerald-500/20 rounded px-1.5 py-0.5 shrink-0 tracking-wider">
                {item.framework}
              </span>
            )}
          </div>
          <p className="text-white/45 text-xs leading-relaxed">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function AuditDashboard({ result, process, apiBase, onExportPDF, exporting }) {
  const [copied, setCopied] = useState(false);
  const overallCfg = SEVERITY_CONFIG[result.overall_severity] || SEVERITY_CONFIG.Medium;

  const highRisks = result.risks?.filter(r => r.severity === "High").length || 0;
  const totalRisks = result.risks?.length || 0;
  const totalGaps = result.control_gaps?.length || 0;
  const totalControls = result.recommended_controls?.length || 0;

  const copyAll = () => {
    const text = `AUDIT AI COPILOT — RISK ASSESSMENT REPORT
==========================================

OVERALL SEVERITY: ${result.overall_severity}
AUDIT OPINION: ${result.audit_opinion}

RISKS (${totalRisks})
${result.risks?.map(r => `  ${r.id} [${r.severity}] ${r.title}\n  ${r.description}`).join("\n\n")}

CONTROL GAPS (${totalGaps})
${result.control_gaps?.map(g => `  ${g.id} [${g.severity}] ${g.title}\n  ${g.description}`).join("\n\n")}

RECOMMENDED CONTROLS (${totalControls})
${result.recommended_controls?.map(c => `  ${c.id} [${c.framework}] ${c.title}\n  ${c.description}`).join("\n\n")}

BUSINESS IMPACT
  Summary: ${result.business_impact?.summary}
  Financial Exposure: ${result.business_impact?.financial_exposure}
  Regulatory Implications: ${result.business_impact?.regulatory_implications}
  Reputational Risk: ${result.business_impact?.reputational_risk}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Executive summary bar */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] text-white/30 tracking-widest mb-1">EXECUTIVE AUDIT OPINION</p>
            <p className="text-white/70 text-sm leading-relaxed max-w-2xl">{result.audit_opinion}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <SeverityBadge severity={result.overall_severity} size="lg" />
            <button
              onClick={onExportPDF}
              disabled={exporting}
              className="text-[11px] border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400/60 hover:text-emerald-400 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
            >
              {exporting ? "⏳ Generating..." : "⬇ Export PDF"}
            </button>
            <button
              onClick={copyAll}
              className="text-[11px] border border-white/10 hover:border-white/20 text-white/40 hover:text-white/70 px-3 py-1.5 rounded-lg transition-all"
            >
              {copied ? "✓ Copied" : "⎘ Copy"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "RISKS IDENTIFIED", value: totalRisks, accent: "text-red-400" },
            { label: "HIGH SEVERITY", value: highRisks, accent: "text-red-400" },
            { label: "CONTROL GAPS", value: totalGaps, accent: "text-amber-400" },
            { label: "CONTROLS REC.", value: totalControls, accent: "text-emerald-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-black/20 rounded-xl p-4 border border-white/5">
              <p className={`text-2xl font-bold ${stat.accent}`}>{stat.value}</p>
              <p className="text-[9px] text-white/25 tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Three column grid */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Risks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[11px] text-white/40 tracking-widest font-medium">RISKS · {totalRisks}</span>
          </div>
          <div className="space-y-3">
            {result.risks?.map((risk, i) => (
              <RiskCard key={risk.id} item={risk} delay={i * 60} />
            ))}
          </div>
        </div>

        {/* Control Gaps */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px] text-white/40 tracking-widest font-medium">CONTROL GAPS · {totalGaps}</span>
          </div>
          <div className="space-y-3">
            {result.control_gaps?.map((gap, i) => (
              <GapCard key={gap.id} item={gap} delay={i * 60} />
            ))}
          </div>
        </div>

        {/* Recommended Controls */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-white/40 tracking-widest font-medium">REC. CONTROLS · {totalControls}</span>
          </div>
          <div className="space-y-3">
            {result.recommended_controls?.map((ctrl, i) => (
              <ControlCard key={ctrl.id} item={ctrl} delay={i * 60} />
            ))}
          </div>
        </div>
      </div>

      {/* Business Impact */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-violet-500" />
          <span className="text-[11px] text-white/40 tracking-widest font-medium">BUSINESS IMPACT ANALYSIS</span>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <p className="text-[10px] text-white/25 tracking-widest mb-2">SUMMARY</p>
            <p className="text-white/65 text-sm leading-relaxed">{result.business_impact?.summary}</p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-white/25 tracking-widest mb-1">FINANCIAL EXPOSURE</p>
              <p className="text-amber-400/80 text-sm">{result.business_impact?.financial_exposure}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/25 tracking-widest mb-1">REGULATORY IMPLICATIONS</p>
              <p className="text-white/50 text-xs leading-relaxed">{result.business_impact?.regulatory_implications}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[10px] text-white/25 tracking-widest">REPUTATIONAL RISK</p>
              <SeverityBadge severity={result.business_impact?.reputational_risk} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
