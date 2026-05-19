import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Building2, ArrowLeft, CheckCircle, Loader2, BarChart3,
  Clock, DollarSign, TrendingUp, Star, FileText, Share2, X
} from "lucide-react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatSqFt(n: number | null | undefined) {
  if (!n) return "—";
  return n.toLocaleString() + " sq ft";
}

const IMPACT_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  low:    { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", label: "Light Refresh" },
  medium: { bg: "bg-[#D4AF37]/10",   text: "text-[#D4AF37]",   border: "border-[#D4AF37]/30",   label: "Moderate Build-Out" },
  high:   { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/30",     label: "Full Transformation" },
};

const PROPERTY_COLORS = ["#D4AF37", "#60A5FA", "#A78BFA"];

export default function CompareProperties() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Safe redirect — never navigate during render (prevents React error #310)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);
  const [comparing, setComparing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: projects, isLoading } = trpc.projects.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const generateReport = trpc.pdf.generateReport.useMutation();
  const createShare = trpc.share.create.useMutation();

  // Only show completed projects
  const completedProjects = useMemo(
    () => (projects ?? []).filter(p => p.status === "complete"),
    [projects]
  );

  // Fetch scenarios for selected projects
  const q0 = trpc.projects.get.useQuery({ id: selectedIds[0] }, { enabled: !!selectedIds[0] && comparing });
  const q1 = trpc.projects.get.useQuery({ id: selectedIds[1] }, { enabled: !!selectedIds[1] && comparing });
  const q2 = trpc.projects.get.useQuery({ id: selectedIds[2] }, { enabled: !!selectedIds[2] && comparing });

  const projectData = [q0.data, q1.data, q2.data].filter(Boolean).slice(0, selectedIds.length);
  const allLoaded = projectData.length === selectedIds.length && selectedIds.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) { toast.error("You can compare up to 3 properties at a time."); return prev; }
      return [...prev, id];
    });
    setComparing(false);
  }

  function getBestScenario(scenarios: any[]) {
    if (!scenarios?.length) return null;
    return scenarios.reduce((best, s) =>
      (s.efficiencyScore ?? 0) > (best.efficiencyScore ?? 0) ? s : best
    , scenarios[0]);
  }

  function getWinner(projectDataArr: any[]) {
    if (!projectDataArr.length) return null;
    return projectDataArr.reduce((best, pd) => {
      const bestS = getBestScenario(pd.scenarios ?? []);
      const currBestS = getBestScenario(best.scenarios ?? []);
      return (bestS?.efficiencyScore ?? 0) > (currBestS?.efficiencyScore ?? 0) ? pd : best;
    }, projectDataArr[0]);
  }

  async function handleExportPDF() {
    if (!selectedIds[0]) return;
    setExporting(true);
    try {
      const result = await generateReport.mutateAsync({ projectId: selectedIds[0] });
      if (result.url) window.open(result.url, "_blank");
      toast.success("Comparison report exported.");
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function handleShare() {
    if (!selectedIds[0]) return;
    try {
      const result = await createShare.mutateAsync({ projectId: selectedIds[0] });
      const shareUrl = `${window.location.origin}/report/${result.token}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Shareable link copied to clipboard.");
    } catch {
      toast.error("Failed to create share link.");
    }
  }

  const winner = allLoaded && comparing ? getWinner(projectData) : null;

  return (
    <div className="min-h-screen bg-[#0A1628] font-['Inter']">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A1628]/95 backdrop-blur-md border-b border-white/8">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/dashboard")} className="text-white/50 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2.5">
                <img src={CDN_ICON} alt="Leasibility AI" className="w-7 h-7 rounded-lg" />
                <span className="font-['Montserrat'] font-700 text-white text-base">
                  Compare <span className="text-[#D4AF37]">Properties</span>
                </span>
              </div>
            </div>
            {comparing && allLoaded && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm transition-colors"
                >
                  <Share2 size={14} /> Share
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-700 text-sm transition-colors disabled:opacity-60"
                >
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  Export Report
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container py-10">
        {/* Step 1: Property Selection */}
        {!comparing && (
          <div>
            <div className="mb-8">
              <h1 className="font-['Montserrat'] font-black text-2xl text-white mb-2">
                Select Properties to Compare
              </h1>
              <p className="text-white/50 text-sm">
                Choose 2 or 3 completed analyses to compare side-by-side. We will surface the best scenario for each and identify the strongest option for your client.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : completedProjects.length === 0 ? (
              <div className="text-center py-20">
                <Building2 size={40} className="text-white/15 mx-auto mb-4" />
                <p className="text-white/40 font-['Montserrat'] font-600 mb-2">No completed analyses yet</p>
                <p className="text-white/25 text-sm mb-6">Run at least 2 analyses to use the comparison tool.</p>
                <button
                  onClick={() => navigate("/new")}
                  className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#0F1F3D] font-['Montserrat'] font-700 text-sm"
                >
                  Start New Analysis
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {completedProjects.map((project, i) => {
                    const selected = selectedIds.includes(project.id);
                    const selIdx = selectedIds.indexOf(project.id);
                    const color = selected ? PROPERTY_COLORS[selIdx] : undefined;
                    return (
                      <button
                        key={project.id}
                        onClick={() => toggleSelect(project.id)}
                        className={`relative text-left p-5 rounded-2xl border transition-all ${
                          selected
                            ? "border-[#D4AF37]/50 bg-[#D4AF37]/5"
                            : "border-white/8 bg-[#0F1F3D] hover:border-white/20"
                        }`}
                      >
                        {selected && (
                          <div
                            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-['Montserrat'] font-800 text-[#0F1F3D]"
                            style={{ backgroundColor: color }}
                          >
                            {selIdx + 1}
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-[#D4AF37]/15" : "bg-white/5"}`}>
                            <Building2 size={16} className={selected ? "text-[#D4AF37]" : "text-white/40"} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-['Montserrat'] font-700 text-white text-sm truncate">{project.propertyName}</p>
                            <p className="text-white/40 text-xs truncate">{project.propertyAddress ?? project.city ?? "—"}</p>
                            <p className="text-white/30 text-xs mt-1">{project.totalSqFt?.toLocaleString()} sq ft · {project.market ?? "—"}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-white/40 text-sm">
                    {selectedIds.length === 0 && "Select 2–3 properties to compare"}
                    {selectedIds.length === 1 && "Select 1 or 2 more properties"}
                    {selectedIds.length === 2 && "Ready to compare — or add a 3rd property"}
                    {selectedIds.length === 3 && "3 properties selected — ready to compare"}
                  </p>
                  <button
                    onClick={() => setComparing(true)}
                    disabled={selectedIds.length < 2}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49b2e] disabled:opacity-40 text-[#0F1F3D] font-['Montserrat'] font-700 text-sm transition-colors"
                  >
                    <BarChart3 size={15} />
                    Compare {selectedIds.length > 0 ? `${selectedIds.length} Properties` : "Properties"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Comparison View */}
        {comparing && (
          <div>
            {/* Back + title */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-['Montserrat'] font-black text-2xl text-white mb-1">
                  Property Comparison
                </h1>
                <p className="text-white/40 text-sm">
                  Best scenario shown per property. Ranked by space efficiency score.
                </p>
              </div>
              <button
                onClick={() => setComparing(false)}
                className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
              >
                <X size={15} /> Edit Selection
              </button>
            </div>

            {!allLoaded ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                <span className="ml-3 text-white/50 text-sm">Loading scenario data...</span>
              </div>
            ) : (
              <>
                {/* Winner Banner */}
                {winner && (
                  <div className="flex items-center gap-3 bg-[#D4AF37]/8 border border-[#D4AF37]/25 rounded-2xl px-5 py-4 mb-8">
                    <Star size={18} className="text-[#D4AF37] shrink-0" />
                    <div>
                      <p className="font-['Montserrat'] font-700 text-white text-sm">
                        Recommended: <span className="text-[#D4AF37]">{winner.project?.propertyName}</span>
                      </p>
                      <p className="text-white/45 text-xs mt-0.5">
                        Highest efficiency score across all selected properties. Best value for your client's program.
                      </p>
                    </div>
                  </div>
                )}

                {/* Side-by-side columns */}
                <div className={`grid gap-5 ${projectData.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
                  {projectData.map((pd: any, idx) => {
                    const project = pd?.project;
                    const scenarios = pd?.scenarios ?? [];
                    const best = getBestScenario(scenarios);
                    const impact = best?.impactLevel ?? "low";
                    const ic = IMPACT_COLORS[impact];
                    const isWinner = winner?.project?.id === project?.id;
                    const color = PROPERTY_COLORS[idx];

                    return (
                      <div
                        key={project?.id}
                        className={`rounded-2xl border overflow-hidden ${isWinner ? "border-[#D4AF37]/40" : "border-white/8"}`}
                      >
                        {/* Property header */}
                        <div className="p-5 border-b border-white/8" style={{ borderTopColor: color, borderTopWidth: 3 }}>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="min-w-0">
                              <p className="font-['Montserrat'] font-700 text-white text-base truncate">{project?.propertyName}</p>
                              <p className="text-white/40 text-xs truncate">{project?.propertyAddress ?? project?.city ?? "—"}</p>
                            </div>
                            {isWinner && (
                              <span className="shrink-0 flex items-center gap-1 bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-['Montserrat'] font-700 px-2.5 py-1 rounded-full">
                                <Star size={10} /> Best
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-white/40">
                            <span>{formatSqFt(project?.totalSqFt)}</span>
                            <span>·</span>
                            <span>{project?.market ?? "—"}</span>
                          </div>
                        </div>

                        {/* Best scenario */}
                        {best ? (
                          <div className="p-5 bg-[#0F1F3D] space-y-4">
                            {/* Impact badge */}
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-['Montserrat'] font-600 ${ic.bg} ${ic.text} ${ic.border}`}>
                              {ic.label}
                            </div>

                            {/* Efficiency Score */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-white/40 text-xs">Space Efficiency</span>
                                <span className="font-['Montserrat'] font-800 text-white text-sm">{best.efficiencyScore}%</span>
                              </div>
                              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${best.efficiencyScore}%`, backgroundColor: color }}
                                />
                              </div>
                            </div>

                            {/* Budget */}
                            <div className="flex items-center gap-2.5 p-3 bg-white/3 rounded-xl">
                              <DollarSign size={14} className="text-white/30 shrink-0" />
                              <div>
                                <p className="text-white/35 text-xs mb-0.5">Budget Range</p>
                                <p className="font-['Montserrat'] font-700 text-white text-sm">
                                  {formatCurrency(best.budgetLow ?? 0)} – {formatCurrency(best.budgetHigh ?? 0)}
                                </p>
                                <p className="text-white/30 text-xs">${best.costPerSqFtLow?.toFixed(0)}–${best.costPerSqFtHigh?.toFixed(0)} / sq ft</p>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="flex items-center gap-2.5 p-3 bg-white/3 rounded-xl">
                              <Clock size={14} className="text-white/30 shrink-0" />
                              <div>
                                <p className="text-white/35 text-xs mb-0.5">Project Timeline</p>
                                <p className="font-['Montserrat'] font-700 text-white text-sm">
                                  {best.scheduleWeeksLow}–{best.scheduleWeeksHigh} weeks
                                </p>
                                <p className="text-white/30 text-xs">Decision to occupancy</p>
                              </div>
                            </div>

                            {/* Usable SF */}
                            <div className="flex items-center gap-2.5 p-3 bg-white/3 rounded-xl">
                              <TrendingUp size={14} className="text-white/30 shrink-0" />
                              <div>
                                <p className="text-white/35 text-xs mb-0.5">Usable Area</p>
                                <p className="font-['Montserrat'] font-700 text-white text-sm">
                                  {formatSqFt(best.usableSqFt)}
                                </p>
                                <p className="text-white/30 text-xs">of {formatSqFt(best.totalSqFt)} total</p>
                              </div>
                            </div>

                            {/* AI Summary */}
                            {best.aiSummary && (
                              <p className="text-white/40 text-xs leading-relaxed border-t border-white/6 pt-3">
                                {best.aiSummary}
                              </p>
                            )}

                            {/* View full analysis link */}
                            <button
                              onClick={() => navigate(`/project/${project?.id}`)}
                              className="w-full text-center text-xs text-white/30 hover:text-[#D4AF37] transition-colors pt-1"
                            >
                              View full analysis →
                            </button>
                          </div>
                        ) : (
                          <div className="p-5 text-center text-white/30 text-sm">No scenarios found.</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Summary Table */}
                <div className="mt-10 bg-[#0F1F3D] border border-white/8 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/8">
                    <h3 className="font-['Montserrat'] font-700 text-white text-base">Side-by-Side Summary</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/6">
                          <th className="text-left px-6 py-3 text-white/30 text-xs font-['Inter'] font-500">Metric</th>
                          {projectData.map((pd: any, idx) => (
                            <th key={idx} className="text-left px-6 py-3 text-xs font-['Montserrat'] font-700" style={{ color: PROPERTY_COLORS[idx] }}>
                              {pd?.project?.propertyName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/4">
                        {[
                          { label: "Total SF", key: (pd: any) => formatSqFt(pd?.project?.totalSqFt) },
                          { label: "Market", key: (pd: any) => pd?.project?.market ?? "—" },
                          { label: "Best Scenario", key: (pd: any) => IMPACT_COLORS[getBestScenario(pd?.scenarios ?? [])?.impactLevel ?? "low"]?.label ?? "—" },
                          { label: "Efficiency Score", key: (pd: any) => `${getBestScenario(pd?.scenarios ?? [])?.efficiencyScore ?? "—"}%` },
                          { label: "Budget Range", key: (pd: any) => { const s = getBestScenario(pd?.scenarios ?? []); return s ? `${formatCurrency(s.budgetLow)} – ${formatCurrency(s.budgetHigh)}` : "—"; } },
                          { label: "Cost / SF", key: (pd: any) => { const s = getBestScenario(pd?.scenarios ?? []); return s ? `$${s.costPerSqFtLow?.toFixed(0)}–$${s.costPerSqFtHigh?.toFixed(0)}` : "—"; } },
                          { label: "Timeline", key: (pd: any) => { const s = getBestScenario(pd?.scenarios ?? []); return s ? `${s.scheduleWeeksLow}–${s.scheduleWeeksHigh} wks` : "—"; } },
                        ].map(row => (
                          <tr key={row.label}>
                            <td className="px-6 py-3 text-white/35 text-xs">{row.label}</td>
                            {projectData.map((pd: any, idx) => (
                              <td key={idx} className="px-6 py-3 text-white text-xs font-['Montserrat'] font-600">
                                {row.key(pd)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
