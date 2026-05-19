import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { Loader2, Building2, Users, MapPin, DollarSign, Calendar, BarChart3, CheckCircle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

const IMPACT_CONFIG = {
  low: {
    label: "Light Refresh",
    badge: "LIGHT REFRESH",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.25)",
    desc: "Maximize reuse of existing walls and infrastructure. Fastest path to occupancy at the lowest cost.",
  },
  medium: {
    label: "Moderate Build-Out",
    badge: "MODERATE BUILD-OUT",
    color: "#D4AF37",
    bg: "rgba(212,175,55,0.08)",
    border: "rgba(212,175,55,0.25)",
    desc: "Reconfigure the core layout while reusing key infrastructure. The balanced choice for cost, timeline, and program fit.",
  },
  high: {
    label: "Full Transformation",
    badge: "FULL TRANSFORMATION",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    desc: "Complete rebuild from base building condition. Fully optimized for your program with no constraints from existing conditions.",
  },
};

function fmt$(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtSqFt(n: number | null | undefined) {
  if (!n) return "—";
  return n.toLocaleString() + " sq ft";
}

function parsePersistedJson(value: any) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function asArray<T = any>(value: any): T[] {
  const parsed = parsePersistedJson(value);
  return Array.isArray(parsed) ? parsed : [];
}

function asObject<T extends Record<string, any> = Record<string, any>>(value: any): T | null {
  const parsed = parsePersistedJson(value);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as T) : null;
}

function normalizeBudgetRows(breakdown: any) {
  const parsed = parsePersistedJson(breakdown);
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== "object") return [];
  return [
    { category: "Construction", ...parsed.construction },
    { category: "Furniture, Fixtures & Equipment", ...parsed.ffe },
    { category: "IT / Audio-Visual", ...parsed.itAv },
    { category: "Soft Costs", ...parsed.softCosts },
    { category: "TI Allowance", ...parsed.tiAllowance },
  ].filter((row) => row.low != null && row.mid != null && row.high != null);
}

function ScenarioCard({ scenario, index }: { scenario: any; index: number }) {
  const [budgetOpen, setBudgetOpen] = useState(index === 0);
  const [scheduleOpen, setScheduleOpen] = useState(index === 0);

  const cfg = IMPACT_CONFIG[scenario.impactLevel as keyof typeof IMPACT_CONFIG] ?? IMPACT_CONFIG.medium;
  const breakdown = normalizeBudgetRows(scenario.budgetBreakdown) as Array<{ category: string; low: number; mid: number; high: number }>;
  const phases = asArray<{ phase: string; weeks: number | string; description: string }>(scenario.schedulePhases);
  const rooms = asArray<{ type: string; count: number; sqFt: number }>(scenario.roomBreakdown);
  const fitVariance = asArray<{ label: string; requested: number; achieved: number; status: string }>(scenario.fitVariance);
  const existingConditions = asObject<{ extractionStatus?: string; confidence?: number; narrative?: string; qaWarnings?: string[] }>(scenario.existingConditions);
  const achievedProgram = asObject<{ fitScore?: number }>(scenario.achievedProgram);

  return (
    <div
      style={{ border: `1px solid ${cfg.border}`, background: cfg.bg }}
      className="rounded-2xl overflow-hidden mb-6"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <span
              style={{ color: cfg.color, borderColor: cfg.border, background: `${cfg.color}18` }}
              className="inline-block text-xs font-['Montserrat'] font-700 uppercase tracking-widest border rounded-full px-3 py-1 mb-2"
            >
              {cfg.badge}
            </span>
            <h3 className="font-['Montserrat'] font-black text-xl text-white">{scenario.label ?? cfg.label}</h3>
            <p className="text-white/50 text-sm font-['Inter'] mt-1">{cfg.desc}</p>
          </div>
          <div className="text-right">
            <div className="font-['Montserrat'] font-black text-3xl" style={{ color: cfg.color }}>
              {scenario.efficiencyScore ?? 0}%
            </div>
            <div className="text-white/40 text-xs font-['Inter']">Efficiency Score</div>
          </div>
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { icon: BarChart3, label: "Usable Area", value: fmtSqFt(scenario.usableSqFt) },
            { icon: DollarSign, label: "Budget Range", value: `${fmt$(scenario.budgetLow ?? 0)} – ${fmt$(scenario.budgetHigh ?? 0)}` },
            { icon: DollarSign, label: "Cost / Sq Ft", value: `$${scenario.costPerSqFtLow ?? 0} – $${scenario.costPerSqFtHigh ?? 0}` },
            { icon: Calendar, label: "Timeline", value: `${scenario.scheduleWeeksLow ?? 0}–${scenario.scheduleWeeksHigh ?? 0} weeks` },
            { icon: CheckCircle, label: "Program Fit", value: achievedProgram?.fitScore != null ? `${achievedProgram.fitScore}%` : "Needs review" },
          ].map((m, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs font-['Inter'] mb-1 flex items-center gap-1">
                <m.icon size={11} /> {m.label}
              </div>
              <div className="font-['Montserrat'] font-700 text-white text-sm">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Existing Conditions and Fit Report */}
      {(existingConditions || fitVariance.length > 0 || scenario.reuseStrategy) && (
        <div className="p-6 border-b border-white/8">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/8">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-['Montserrat'] font-700 text-white/70 text-xs uppercase tracking-widest">Existing Conditions</h4>
                <span className="text-xs font-['Inter']" style={{ color: cfg.color }}>{existingConditions?.extractionStatus ?? scenario.validationStatus ?? "needs_review"}</span>
              </div>
              <p className="text-white/55 text-sm font-['Inter'] leading-relaxed mb-3">{existingConditions?.narrative ?? "Existing-condition inventory was generated from uploaded plan context and intake assumptions."}</p>
              {scenario.reuseStrategy && <p className="text-white/45 text-xs font-['Inter'] leading-relaxed"><strong className="text-white/70">Reuse strategy:</strong> {scenario.reuseStrategy}</p>}
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/8">
              <h4 className="font-['Montserrat'] font-700 text-white/70 text-xs uppercase tracking-widest mb-3">Achieved vs Requested</h4>
              <div className="space-y-2 max-h-56 overflow-auto pr-1">
                {fitVariance.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center text-xs font-['Inter'] border-b border-white/5 pb-2 last:border-0">
                    <span className="text-white/70 truncate">{row.label}</span>
                    <span className="text-white/35">Req {row.requested}</span>
                    <span className="text-white/65">Got {row.achieved}</span>
                    <span className="uppercase font-['Montserrat'] font-700" style={{ color: row.status === "met" ? "#22c55e" : row.status === "partial" ? "#D4AF37" : "#ef4444" }}>{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout — AI Image or SVG Fallback */}
      {(scenario.layoutImageUrl || scenario.layoutSvg) && (
        <div className="p-6 border-b border-white/8">
          <h4 className="font-['Montserrat'] font-700 text-white/70 text-xs uppercase tracking-widest mb-3">Space Layout</h4>
          {scenario.layoutImageUrl ? (
            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0A1628]">
              <img
                src={scenario.layoutImageUrl}
                alt={`Floor plan for ${scenario.label}`}
                className="w-full h-auto object-contain"
              />
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden border border-white/10 bg-[#0A1628]"
              dangerouslySetInnerHTML={{ __html: scenario.layoutSvg! }}
            />
          )}
        </div>
      )}

      {/* Room Breakdown */}
      {rooms.length > 0 && (
        <div className="p-6 border-b border-white/8">
          <h4 className="font-['Montserrat'] font-700 text-white/70 text-xs uppercase tracking-widest mb-3">Program Breakdown</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {rooms.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-sm">
                <span className="text-white/70 font-['Inter']">{r.type}</span>
                <span className="text-white font-['Montserrat'] font-700 ml-2">{r.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Breakdown */}
      <div className="border-b border-white/8">
        <button
          onClick={() => setBudgetOpen(!budgetOpen)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-white/3 transition-colors"
        >
          <span className="font-['Montserrat'] font-700 text-white text-sm uppercase tracking-wider">Budget Breakdown</span>
          <span className="text-white/40 text-xs">{budgetOpen ? "▲ Hide" : "▼ Show"}</span>
        </button>
        {budgetOpen && breakdown.length > 0 && (
          <div className="px-6 pb-6">
            <div className="rounded-xl overflow-hidden border border-white/8">
              <table className="w-full text-sm font-['Inter']">
                <thead>
                  <tr className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-right px-4 py-3">Low</th>
                    <th className="text-right px-4 py-3">Mid</th>
                    <th className="text-right px-4 py-3">High</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b: any, i: number) => (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/3">
                      <td className="px-4 py-3 text-white/80">{b.category}</td>
                      <td className="px-4 py-3 text-right text-white/60">{fmt$(b.low)}</td>
                      <td className="px-4 py-3 text-right text-white">{fmt$(b.mid)}</td>
                      <td className="px-4 py-3 text-right text-white/60">{fmt$(b.high)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/15 bg-white/5 font-700">
                    <td className="px-4 py-3 text-white font-['Montserrat'] font-700">Total Estimate</td>
                    <td className="px-4 py-3 text-right text-white/70">{fmt$(scenario.budgetLow ?? 0)}</td>
                    <td className="px-4 py-3 text-right" style={{ color: cfg.color }}>{fmt$(scenario.budgetMid ?? 0)}</td>
                    <td className="px-4 py-3 text-right text-white/70">{fmt$(scenario.budgetHigh ?? 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-white/30 text-xs font-['Inter'] mt-3">
              * Estimates based on national cost benchmarks. Actual costs vary by market, contractor, and conditions.
            </p>
          </div>
        )}
      </div>

      {/* Schedule */}
      <div>
        <button
          onClick={() => setScheduleOpen(!scheduleOpen)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-white/3 transition-colors"
        >
          <span className="font-['Montserrat'] font-700 text-white text-sm uppercase tracking-wider">Project Schedule</span>
          <span className="text-white/40 text-xs">{scheduleOpen ? "▲ Hide" : "▼ Show"}</span>
        </button>
        {scheduleOpen && phases.length > 0 && (
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {phases.map((p: any, i: number) => {
                const totalWeeks = phases.reduce((sum: number, ph: any) => sum + Number(ph.weeks), 0);
                const widthPct = Math.round((Number(p.weeks) / totalWeeks) * 100);
                return (
                  <div key={i} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-['Montserrat'] font-700"
                          style={{ background: cfg.color, color: "#0F1F3D" }}
                        >
                          {i + 1}
                        </div>
                        <span className="font-['Montserrat'] font-700 text-white text-sm">{p.phase}</span>
                      </div>
                      <span className="text-white/50 text-xs font-['Inter']">{p.weeks} weeks</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${widthPct}%`, background: cfg.color }}
                      />
                    </div>
                    <p className="text-white/50 text-xs font-['Inter']">{p.description}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 bg-white/5 rounded-xl p-4 flex items-center justify-between">
              <span className="font-['Montserrat'] font-700 text-white text-sm">Total Estimated Duration</span>
              <span className="font-['Montserrat'] font-black text-lg" style={{ color: cfg.color }}>
                {scenario.scheduleWeeksLow}–{scenario.scheduleWeeksHigh} weeks
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SharedReport() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = trpc.share.getReport.useQuery(
    { token: token ?? "", userAgent: navigator.userAgent },
    { enabled: !!token, retry: false }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-white/50 font-['Inter'] text-sm">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <ExternalLink size={24} className="text-red-400" />
          </div>
          <h1 className="font-['Montserrat'] font-black text-2xl text-white mb-2">Report Not Found</h1>
          <p className="text-white/50 font-['Inter'] text-sm">
            This report link may have expired or been revoked. Contact your broker for an updated link.
          </p>
        </div>
      </div>
    );
  }

  const { project, scenarios: scenarioList, broker, brokerUser } = data;
  const brokerName = broker?.brokerName ?? brokerUser?.name ?? "Your Broker";
  const brokerTitle = broker?.brokerTitle ?? "Tenant Rep Broker";
  const brokerCompany = broker?.brokerCompany ?? "CREEL Solutions LLC";
  const brokerPhone = broker?.brokerPhone ?? "";
  const brokerEmail = broker?.brokerEmail ?? brokerUser?.email ?? "";
  const scenarios = asArray<any>(scenarioList).sort((a, b) => (a.scenarioNumber ?? 0) - (b.scenarioNumber ?? 0));

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Header */}
      <header className="border-b border-white/8 bg-[#0A1628]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={CDN_ICON} alt="Leasibility AI" className="w-8 h-8 rounded-xl" />
            <span className="font-['Montserrat'] font-800 text-lg text-white">
              Leasibility <span className="text-[#D4AF37]">AI</span>
            </span>
          </div>
          <div className="text-white/40 text-xs font-['Inter']">Space Intelligence Report</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Property Summary */}
        <div className="bg-[#0F1F3D] border border-white/8 rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-['Montserrat'] font-black text-2xl md:text-3xl text-white mb-2">
                {project.propertyName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/50 text-sm font-['Inter']">
                {project.propertyAddress && (
                  <span className="flex items-center gap-1.5"><MapPin size={13} />{project.propertyAddress}</span>
                )}
                {project.totalSqFt && (
                  <span className="flex items-center gap-1.5"><Building2 size={13} />{fmtSqFt(project.totalSqFt)}</span>
                )}
                {project.headcount && (
                  <span className="flex items-center gap-1.5"><Users size={13} />{project.headcount} people</span>
                )}
                {project.market && (
                  <span className="flex items-center gap-1.5"><BarChart3 size={13} />{project.market} market</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-['Montserrat'] font-700">3 Scenarios Ready</span>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-3">
            <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">
              AI-Generated Space Analysis
            </span>
          </div>
          <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-2">
            Three Scenarios. One Decision.
          </h2>
          <p className="text-white/55 font-['Inter'] leading-relaxed max-w-2xl">
            Each scenario below represents a different approach to building out this space — from minimal disruption to a complete transformation.
            Review the layouts, budgets, and timelines to determine which path best fits your program and timeline.
          </p>
        </div>

        {/* Scenarios */}
        {scenarios.map((s, i) => (
          <ScenarioCard key={s.id} scenario={s} index={i} />
        ))}

        {/* Disclaimer */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-5 mb-8">
          <p className="text-white/35 text-xs font-['Inter'] leading-relaxed">
            <strong className="text-white/50">Important Disclaimer:</strong> All budget estimates and project timelines are AI-generated approximations based on publicly reported national benchmarks and are provided for feasibility purposes only. They do not constitute a professional contractor bid, architectural assessment, or legal advice. Actual costs and timelines will vary based on local market conditions, building conditions, contractor availability, and permit requirements. Always consult licensed professionals before making leasing or construction decisions.
          </p>
        </div>

        {/* Broker Card */}
        <div className="bg-[#0F1F3D] border border-[#D4AF37]/20 rounded-2xl p-6">
          <p className="text-white/40 text-xs font-['Inter'] uppercase tracking-wider mb-4">Prepared by</p>
          <div className="flex items-center gap-4">
            {broker?.brokerPhotoUrl ? (
              <img
                src={broker.brokerPhotoUrl}
                alt={brokerName}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37]/30 flex items-center justify-center">
                <span className="font-['Montserrat'] font-black text-xl text-[#D4AF37]">
                  {brokerName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="font-['Montserrat'] font-800 text-white text-lg">{brokerName}</div>
              <div className="text-white/50 text-sm font-['Inter']">{brokerTitle}</div>
              <div className="text-[#D4AF37]/70 text-sm font-['Inter']">{brokerCompany}</div>
            </div>
            {broker?.brokerLogoUrl && (
              <img
                src={broker.brokerLogoUrl}
                alt={brokerCompany}
                className="h-10 object-contain opacity-70"
              />
            )}
          </div>
          {(brokerPhone || brokerEmail) && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/8">
              {brokerPhone && (
                <a href={`tel:${brokerPhone}`} className="text-white/50 hover:text-white text-sm font-['Inter'] transition-colors">
                  📞 {brokerPhone}
                </a>
              )}
              {brokerEmail && (
                <a href={`mailto:${brokerEmail}`} className="text-white/50 hover:text-white text-sm font-['Inter'] transition-colors">
                  ✉️ {brokerEmail}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-8 border-t border-white/8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={CDN_ICON} alt="Leasibility AI" className="w-5 h-5 rounded-md" />
            <span className="font-['Montserrat'] font-700 text-white/40 text-sm">
              Powered by Leasibility <span className="text-[#D4AF37]/60">AI</span>
            </span>
          </div>
          <p className="text-white/20 text-xs font-['Inter']">
            © 2026 CREEL Solutions LLC. AI-generated estimates are for feasibility only, not professional bids.
          </p>
        </div>
      </main>
    </div>
  );
}
