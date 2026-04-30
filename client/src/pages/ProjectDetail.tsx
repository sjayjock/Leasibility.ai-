import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Building2, Users, MapPin, Loader2,
  DollarSign, Calendar, BarChart3, CheckCircle,
  ChevronDown, ChevronUp, FileText, Share2, RefreshCw, Eye,
  Link2, Trash2, Clock
} from "lucide-react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

function fmt$(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

function fmtSqFt(n: number | null) {
  if (!n) return "—";
  return n.toLocaleString() + " sq ft";
}

type RoomRow = { type: string; count: number; sqFt: number };
type SchedulePhase = { phase: string; weeks: string; description: string };
type BudgetBreakdown = {
  construction: { low: number; mid: number; high: number };
  ffe: { low: number; mid: number; high: number };
  itAv: { low: number; mid: number; high: number };
  softCosts: { low: number; mid: number; high: number };
  tiAllowance: { low: number; mid: number; high: number };
};

type InventoryItem = { category: string; count: number; estimatedSqFt: number; approximateLocation: string; reusePotential: string; confidence: number; notes: string };

type ExistingConditionsInventory = {
  summary: string;
  reusableZones: InventoryItem[];
  repurposableZones: InventoryItem[];
  fixedElements: InventoryItem[];
  ambiguousAreas: InventoryItem[];
  reconfigurationZones: InventoryItem[];
  reviewRequired: boolean;
  reviewReasons: string[];
};

type ProgramFitSummary = {
  rows: Array<{ programItem: string; requested: number; achieved: number; variance: number; fitStatus: "met" | "partial" | "gap" | "surplus"; notes: string }>;
  gaps: Array<{ programItem: string; requested: number; achieved: number; variance: number; fitStatus: "met" | "partial" | "gap" | "surplus"; notes: string }>;
  achievedPercent: number;
  interpretation: string;
};

type ScopeSummary = {
  reuseStrategy: string;
  retainedElements: string[];
  repurposedElements: string[];
  reconfigurationScope: string[];
  programGaps: string[];
  budgetScheduleRationale: string;
};

type RenderingStatus = { status: "ready" | "needs_review"; message: string; reasons: string[]; confidence: number };

export default function ProjectDetail() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id ?? "0");
  const [activeScenario, setActiveScenario] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>("budget");
  const [showLinkPanel, setShowLinkPanel] = useState(false);

  // Safe redirect — never navigate during render (prevents React error #310)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  const { data, isLoading, refetch } = trpc.projects.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && !!projectId }
  );

  const reanalyze = trpc.projects.analyze.useMutation({
    onSuccess: () => { refetch(); toast.success("Re-analysis complete!"); },
    onError: (e) => toast.error(e.message),
  });

  const shareCreate = trpc.share.create.useMutation({
    onSuccess: (data) => {
      const url = `${window.location.origin}/report/${data.token}`;
      navigator.clipboard.writeText(url).then(() => {
        toast.success("Share link copied to clipboard!", {
          description: url,
          duration: 5000,
        });
      }).catch(() => {
        toast.success(`Share link: ${url}`);
      });
    },
    onError: (e: { message: string }) => toast.error("Could not create share link: " + e.message),
  });

  const revokeShare = trpc.share.revoke.useMutation({
    onSuccess: () => { refetchViews(); toast.success("Link revoked."); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const { data: viewData, refetch: refetchViews } = trpc.share.getViews.useQuery(
    { projectId },
    { enabled: isAuthenticated && !!projectId && !loading }
  );

  const exportPdf = trpc.pdf.generateReport.useMutation({
    onSuccess: (data: { url: string; html: string }) => {
      window.open(data.url, "_blank");
      toast.success("Report ready — opening in new tab.");
    },
    onError: (e: { message: string }) => toast.error("PDF export failed: " + e.message),
  });

  if (loading || isLoading || !isAuthenticated) return <LoadingScreen />;
  if (!data) return <div className="min-h-screen bg-[#0A1628] flex items-center justify-center text-white/50">Project not found.</div>;

  const { project, scenarios } = data;
  const scenario = scenarios[activeScenario];
  const rooms = (scenario?.roomBreakdown as RoomRow[] | null) ?? [];
  const schedulePhases = (scenario?.schedulePhases as SchedulePhase[] | null) ?? [];
  const budgetBreakdown = (scenario?.budgetBreakdown as BudgetBreakdown | null);
  const existingInventory = (scenario?.existingConditionsInventory as ExistingConditionsInventory | null) ?? null;
  const programFit = (scenario?.programFit as ProgramFitSummary | null) ?? null;
  const scopeSummary = (scenario?.scopeSummary as ScopeSummary | null) ?? null;
  const renderingStatus = (scenario?.renderingStatus as RenderingStatus | null) ?? null;

  const isAnalyzing = project.status === "analyzing";
  const hasScenarios = scenarios.length > 0;

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Header */}
      <header className="border-b border-white/8 bg-[#0A1628]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm font-['Inter']">Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <img src={CDN_ICON} alt="" className="w-7 h-7 rounded-lg" />
            <span className="font-['Montserrat'] font-700 text-sm text-white truncate max-w-[200px]">{project.propertyName}</span>
          </div>
          <div className="flex items-center gap-2">
            {hasScenarios && (
              <>
                <button
                  onClick={() => shareCreate.mutate({ projectId })}
                  disabled={shareCreate.isPending}
                  className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-['Inter'] border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {shareCreate.isPending ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} />}
                  {shareCreate.isPending ? "Creating..." : "Share"}
                  {viewData?.viewCount ? (
                    <span className="flex items-center gap-0.5 text-[#D4AF37] ml-1">
                      <Eye size={11} />{viewData.viewCount}
                    </span>
                  ) : null}
                </button>
                <button
                  onClick={() => exportPdf.mutate({ projectId })}
                  disabled={exportPdf.isPending}
                  className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-700 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {exportPdf.isPending ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
                  {exportPdf.isPending ? "Generating..." : "Export PDF"}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Property Summary */}
        <div className="bg-[#0F1F3D] border border-white/8 rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-['Montserrat'] font-black text-xl text-white mb-1 truncate">{project.propertyName}</h1>
            <div className="flex flex-wrap items-center gap-3 text-white/40 text-xs font-['Inter']">
              {project.propertyAddress && <span className="flex items-center gap-1"><MapPin size={11} />{project.propertyAddress}</span>}
              {project.totalSqFt && <span className="flex items-center gap-1"><Building2 size={11} />{fmtSqFt(project.totalSqFt)}</span>}
              {project.headcount && <span className="flex items-center gap-1"><Users size={11} />{project.headcount} people</span>}
              {project.industry && <span className="flex items-center gap-1"><BarChart3 size={11} />{project.industry}</span>}
              {project.market && <span className="flex items-center gap-1"><MapPin size={11} />{project.market}</span>}
            </div>
          </div>
          {project.floorPlanUrl && (
            <img src={project.floorPlanUrl} alt="Floor plan" className="w-20 h-14 object-cover rounded-xl border border-white/10" />
          )}
          <button
            onClick={() => reanalyze.mutate({ projectId })}
            disabled={isAnalyzing || reanalyze.isPending}
            className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-['Inter'] border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
          >
            <RefreshCw size={12} className={isAnalyzing || reanalyze.isPending ? "animate-spin" : ""} />
            Re-analyze
          </button>
        </div>

        {/* Analyzing State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 size={40} className="text-[#D4AF37] animate-spin mb-4" />
            <h3 className="font-['Montserrat'] font-700 text-white text-lg mb-2">Generating Scenarios...</h3>
            <p className="text-white/40 font-['Inter'] text-sm">The AI is analyzing your space. This takes about 15–30 seconds.</p>
          </div>
        )}

        {/* No Scenarios Yet */}
        {!isAnalyzing && !hasScenarios && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">
              <BarChart3 size={28} className="text-[#D4AF37]" />
            </div>
            <h3 className="font-['Montserrat'] font-700 text-white text-lg mb-2">No scenarios yet</h3>
            <p className="text-white/40 font-['Inter'] text-sm mb-5">Run the AI analysis to generate space plans, budgets, and schedules.</p>
            <button
              onClick={() => reanalyze.mutate({ projectId })}
              disabled={reanalyze.isPending}
              className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-700 text-sm px-6 py-3 rounded-xl transition-colors"
            >
              {reanalyze.isPending ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
              Generate AI Scenarios
            </button>
          </div>
        )}

        {/* Scenarios */}
        {!isAnalyzing && hasScenarios && (
          <div>
            {/* Scenario Tabs */}
            <div className="flex gap-3 mb-6">
            {scenarios.map((s, i) => {
              const impactColors = [
                { border: "border-emerald-500/50", bg: "bg-emerald-500/10", tag: "text-emerald-400", activeBorder: "border-emerald-500" },
                { border: "border-[#D4AF37]/50",   bg: "bg-[#D4AF37]/10",   tag: "text-[#D4AF37]",  activeBorder: "border-[#D4AF37]" },
                { border: "border-red-400/50",      bg: "bg-red-400/10",     tag: "text-red-400",    activeBorder: "border-red-400" },
              ];
              const col = impactColors[i] ?? impactColors[1];
              const impactTag = (s as any).impactTag ?? `Scenario ${i + 1}`;
              return (
                <button
                  key={i}
                  onClick={() => setActiveScenario(i)}
                  className={`flex-1 py-3 px-3 rounded-xl border text-sm font-['Montserrat'] font-700 transition-all ${
                    activeScenario === i
                      ? `${col.activeBorder} ${col.bg} text-white`
                      : `${col.border} bg-[#0F1F3D] text-white/50 hover:text-white/80`
                  }`}
                >
                  <div className={`text-xs mb-0.5 font-['Inter'] ${activeScenario === i ? col.tag : "text-white/30"}`}>{impactTag}</div>
                  <div className="text-xs sm:text-sm truncate">{s.label}</div>
                </button>
              );
            })}
            </div>

            {scenario && (
              <div className="space-y-4">
                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricCard
                    icon={BarChart3}
                    label="Efficiency Score"
                    value={`${scenario.efficiencyScore}%`}
                    sub={`${fmtSqFt(scenario.usableSqFt)} usable`}
                    highlight
                  />
                  <MetricCard
                    icon={DollarSign}
                    label="Budget Range"
                    value={`${fmt$(scenario.budgetLow ?? 0)}–${fmt$(scenario.budgetHigh ?? 0)}`}
                    sub={`$${scenario.costPerSqFtLow}–$${scenario.costPerSqFtHigh}/sq ft`}
                  />
                  <MetricCard
                    icon={Calendar}
                    label="Schedule"
                    value={`${scenario.scheduleWeeksLow}–${scenario.scheduleWeeksHigh} wks`}
                    sub={`~${scenario.scheduleWeeksMid} weeks typical`}
                  />
                  <MetricCard
                    icon={Users}
                    label="Rooms"
                    value={`${rooms.reduce((a, r) => a + r.count, 0)}`}
                    sub={`${rooms.length} room types`}
                  />
                </div>

                {/* AI Summary */}
                {scenario.aiSummary && (
                  <div className="bg-[#0F1F3D] border border-[#D4AF37]/20 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-[#D4AF37]/20 flex items-center justify-center">
                        <CheckCircle size={11} className="text-[#D4AF37]" />
                      </div>
                      <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-wider">AI Analysis</span>
                    </div>
                    <p className="text-white/75 font-['Inter'] text-sm leading-relaxed">{scenario.aiSummary}</p>
                  </div>
                )}

                {/* Floor Plan — AI Image or SVG Fallback */}
                {(scenario.layoutImageUrl || scenario.layoutSvg) && (
                  <div className="bg-[#0F1F3D] border border-white/8 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-['Montserrat'] font-700 text-sm">Space Plan — {scenario.label}</span>
                      <span className="text-white/30 text-xs font-['Inter']">Deterministic architectural renderer</span>
                    </div>
                    {renderingStatus?.status === "needs_review" && (
                      <div className="mb-3 bg-amber-500/10 border border-amber-400/30 rounded-xl p-3">
                        <div className="text-amber-300 font-['Montserrat'] font-700 text-xs uppercase tracking-wider mb-1">Parser Review Required</div>
                        <p className="text-amber-100/75 font-['Inter'] text-xs leading-relaxed">{renderingStatus.message}</p>
                      </div>
                    )}
                    <div
                      className="w-full rounded-xl overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: scenario.layoutSvg! }}
                    />
                    <p className="text-white/25 text-xs font-['Inter'] mt-2 text-center">
                      {scenario.layoutDescription}
                    </p>
                  </div>
                )}

                {/* Program Fit */}
                {programFit && programFit.rows.length > 0 && (
                  <Accordion
                    title={`Program Fit — ${programFit.achievedPercent}%`}
                    icon={CheckCircle}
                    id="programFit"
                    expanded={expandedSection}
                    onToggle={setExpandedSection}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-['Inter']">
                        <thead className="text-white/35 border-b border-white/8">
                          <tr>
                            <th className="py-2 pr-3 font-600">Program</th>
                            <th className="py-2 px-3 font-600 text-right">Requested</th>
                            <th className="py-2 px-3 font-600 text-right">Achieved</th>
                            <th className="py-2 pl-3 font-600">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {programFit.rows.map((row, i) => (
                            <tr key={i}>
                              <td className="py-2.5 pr-3 text-white/80">{row.programItem}<div className="text-white/35 mt-0.5">{row.notes}</div></td>
                              <td className="py-2.5 px-3 text-right text-white/55">{row.requested}</td>
                              <td className="py-2.5 px-3 text-right text-white/85">{row.achieved}</td>
                              <td className="py-2.5 pl-3">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${row.fitStatus === "met" || row.fitStatus === "surplus" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20" : row.fitStatus === "partial" ? "bg-amber-500/10 text-amber-300 border border-amber-400/20" : "bg-red-500/10 text-red-300 border border-red-400/20"}`}>{row.fitStatus.replace("_", " ")}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-white/45 text-xs font-['Inter'] leading-relaxed mt-3">{programFit.interpretation}</p>
                  </Accordion>
                )}

                {/* Existing Conditions */}
                {existingInventory && (
                  <Accordion
                    title="Existing Conditions Inventory"
                    icon={FileText}
                    id="existingConditions"
                    expanded={expandedSection}
                    onToggle={setExpandedSection}
                  >
                    <p className="text-white/55 text-sm font-['Inter'] leading-relaxed mb-4">{existingInventory.summary}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[["Reusable Zones", existingInventory.reusableZones], ["Repurposable Zones", existingInventory.repurposableZones], ["Fixed Elements", existingInventory.fixedElements], ["Reconfiguration Zones", existingInventory.reconfigurationZones]].map(([label, items]) => (
                        <div key={label as string} className="bg-white/[0.03] border border-white/8 rounded-xl p-3">
                          <div className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-wider mb-2">{label as string}</div>
                          <div className="divide-y divide-white/5">
                            {(items as InventoryItem[]).map((item, i) => (
                              <div key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                                <span className="text-white/75 font-['Inter']">{item.category}</span>
                                <span className="text-white/45 font-['Inter'] text-right">×{item.count} · {item.estimatedSqFt.toLocaleString()} sf</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Accordion>
                )}

                {/* Scope Summary */}
                {scopeSummary && (
                  <Accordion
                    title="Scope Summary"
                    icon={Clock}
                    id="scope"
                    expanded={expandedSection}
                    onToggle={setExpandedSection}
                  >
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        ["Reuse Strategy", scopeSummary.reuseStrategy],
                        ["Retained Elements", scopeSummary.retainedElements.join(", ") || "No major retained elements identified."],
                        ["Reconfiguration Scope", scopeSummary.reconfigurationScope.join(", ") || "No major reconfiguration scope identified."],
                        ["Budget / Schedule Rationale", scopeSummary.budgetScheduleRationale],
                      ].map(([label, value]) => (
                        <div key={label} className="bg-white/[0.03] border border-white/8 rounded-xl p-3">
                          <div className="text-white/35 text-[10px] font-['Montserrat'] font-700 uppercase tracking-wider mb-1">{label}</div>
                          <p className="text-white/70 text-sm font-['Inter'] leading-relaxed">{value}</p>
                        </div>
                      ))}
                    </div>
                  </Accordion>
                )}

                {/* Room Breakdown */}
                {rooms.length > 0 && (
                  <Accordion
                    title="Room Breakdown"
                    icon={Building2}
                    id="rooms"
                    expanded={expandedSection}
                    onToggle={setExpandedSection}
                  >
                    <div className="divide-y divide-white/5">
                      {rooms.map((r, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5">
                          <span className="text-white/80 text-sm font-['Inter']">{r.type}</span>
                          <div className="flex items-center gap-4 text-right">
                            <span className="text-white/40 text-xs font-['Inter']">{r.sqFt.toLocaleString()} sq ft ea.</span>
                            <span className="text-[#D4AF37] font-['Montserrat'] font-700 text-sm w-8 text-right">×{r.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Accordion>
                )}

                {/* Budget Breakdown */}
                {budgetBreakdown && (
                  <Accordion
                    title="Budget Breakdown"
                    icon={DollarSign}
                    id="budget"
                    expanded={expandedSection}
                    onToggle={setExpandedSection}
                  >
                    <div className="space-y-1 mb-4">
                      {[
                        { label: "Construction", data: budgetBreakdown.construction },
                        { label: "Furniture, Fixtures & Equipment", data: budgetBreakdown.ffe },
                        { label: "IT / Audio-Visual", data: budgetBreakdown.itAv },
                        { label: "Soft Costs (Design, Permits)", data: budgetBreakdown.softCosts },
                        { label: "TI Allowance (Est.)", data: budgetBreakdown.tiAllowance },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5">
                          <span className="text-white/70 text-sm font-['Inter']">{row.label}</span>
                          <span className="text-white font-['Montserrat'] font-600 text-sm">
                            {fmt$(row.data.low)} – {fmt$(row.data.high)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-[#D4AF37] font-['Montserrat'] font-700 text-sm">Total Estimated Budget</span>
                      <span className="text-white font-['Montserrat'] font-black text-lg">
                        {fmt$(scenario.budgetLow ?? 0)} – {fmt$(scenario.budgetHigh ?? 0)}
                      </span>
                    </div>
                    <p className="text-white/25 text-xs font-['Inter'] mt-2">
                      Based on {project.market ?? "national"} market benchmarks. Ranges reflect low/high contractor bids. Not a formal contractor estimate.
                    </p>
                  </Accordion>
                )}

                {/* Schedule Forecast */}
                {schedulePhases.length > 0 && (
                  <Accordion
                    title="Schedule Forecast"
                    icon={Calendar}
                    id="schedule"
                    expanded={expandedSection}
                    onToggle={setExpandedSection}
                  >
                    <div className="space-y-1 mb-4">
                      {schedulePhases.map((phase, i) => (
                        <div key={i} className="flex gap-4 py-3 border-b border-white/5">
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center">
                              <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700">{i + 1}</span>
                            </div>
                            {i < schedulePhases.length - 1 && <div className="w-px flex-1 bg-white/10 min-h-[16px]" />}
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-white font-['Montserrat'] font-700 text-sm">{phase.phase}</span>
                              <span className="text-[#D4AF37] text-xs font-['Inter'] font-600">{phase.weeks} wks</span>
                            </div>
                            <p className="text-white/45 text-xs font-['Inter'] leading-relaxed">{phase.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-[#D4AF37] font-['Montserrat'] font-700 text-sm">Total Project Timeline</span>
                      <span className="text-white font-['Montserrat'] font-black text-lg">
                        {scenario.scheduleWeeksLow}–{scenario.scheduleWeeksHigh} weeks
                      </span>
                    </div>
                    <p className="text-white/25 text-xs font-['Inter'] mt-2">
                      Schedule based on {project.market ?? "national"} market data and estimated demo/build complexity. Actual timelines vary by contractor and permit jurisdiction.
                    </p>
                  </Accordion>
                )}

                {/* Export CTA */}
                <div className="bg-gradient-to-r from-[#0F1F3D] to-[#1A2B4A] border border-[#D4AF37]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-['Montserrat'] font-700 text-white text-base mb-1">Ready to share with your client?</h3>
                    <p className="text-white/50 font-['Inter'] text-sm">Export a branded PDF or send a shareable link. Know the moment your client opens it.</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => { shareCreate.mutate({ projectId }); setShowLinkPanel(true); }}
                      disabled={shareCreate.isPending}
                      className="flex items-center gap-1.5 border border-white/15 text-white/70 hover:text-white font-['Inter'] text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {shareCreate.isPending ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                      Share Link
                    </button>
                    <button
                      onClick={() => exportPdf.mutate({ projectId })}
                      disabled={exportPdf.isPending}
                      className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-700 text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {exportPdf.isPending ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                      {exportPdf.isPending ? "Generating..." : "Export PDF"}
                    </button>
                  </div>
                </div>

                {/* Share Link Management Panel */}
                {showLinkPanel && viewData && (
                  <div className="bg-[#0F1F3D] border border-white/8 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Link2 size={15} className="text-[#D4AF37]" />
                        <span className="font-['Montserrat'] font-700 text-white text-sm">Active Share Links</span>
                        {viewData.viewCount > 0 && (
                          <span className="flex items-center gap-1 text-[#D4AF37] text-xs bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-0.5 rounded-full">
                            <Eye size={10} /> {viewData.viewCount} total view{viewData.viewCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <button onClick={() => setShowLinkPanel(false)} className="text-white/30 hover:text-white transition-colors">
                        <ChevronUp size={16} />
                      </button>
                    </div>

                    {!viewData.hasLink ? (
                      <p className="text-white/30 text-sm font-['Inter'] text-center py-4">No active links. Click "Share Link" above to create one.</p>
                    ) : (
                      <div className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl p-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-[#D4AF37] text-xs font-mono truncate">
                              {window.location.origin}/report/{viewData.token}
                            </code>
                          </div>
                          <div className="flex items-center gap-3 text-white/30 text-xs font-['Inter']">
                            <span className="flex items-center gap-1"><Eye size={10} /> {viewData.viewCount} view{viewData.viewCount !== 1 ? 's' : ''}</span>
                            {viewData.lastViewedAt && (
                              <span className="flex items-center gap-1"><Clock size={10} /> Last opened {new Date(viewData.lastViewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/report/${viewData.token}`;
                              navigator.clipboard.writeText(url).then(() => toast.success("Link copied!")).catch(() => toast.info(url));
                            }}
                            className="text-white/40 hover:text-white text-xs font-['Inter'] border border-white/10 hover:border-white/25 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => { if (confirm('Revoke this link? Clients with this link will no longer be able to view the report.')) revokeShare.mutate({ projectId }); }}
                            disabled={revokeShare.isPending}
                            className="text-red-400/60 hover:text-red-400 text-xs border border-red-400/20 hover:border-red-400/40 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, highlight }: {
  icon: React.ElementType; label: string; value: string; sub: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 border ${highlight ? "bg-[#D4AF37]/8 border-[#D4AF37]/25" : "bg-[#0F1F3D] border-white/8"}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={13} className={highlight ? "text-[#D4AF37]" : "text-white/40"} />
        <span className="text-white/40 text-xs font-['Inter']">{label}</span>
      </div>
      <div className={`font-['Montserrat'] font-black text-xl mb-0.5 ${highlight ? "text-[#D4AF37]" : "text-white"}`}>{value}</div>
      <div className="text-white/35 text-xs font-['Inter']">{sub}</div>
    </div>
  );
}

function Accordion({ title, icon: Icon, id, expanded, onToggle, children }: {
  title: string; icon: React.ElementType; id: string;
  expanded: string | null; onToggle: (id: string | null) => void; children: React.ReactNode;
}) {
  const isOpen = expanded === id;
  return (
    <div className="bg-[#0F1F3D] border border-white/8 rounded-2xl overflow-hidden">
      <button
        onClick={() => onToggle(isOpen ? null : id)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} className="text-[#D4AF37]" />
          <span className="font-['Montserrat'] font-700 text-white text-sm">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
    </div>
  );
}
