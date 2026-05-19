import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Building2, Plus, Clock, CheckCircle, AlertCircle, Loader2,
  BarChart3, FileText, ChevronRight, Trash2, LogOut, User,
  CreditCard, Eye, GitCompare, Sparkles, ArrowRight, X,
  Upload, Share2, Bell, AlertTriangle, Gift
} from "lucide-react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

const STATUS_CONFIG = {
  draft: { label: "Draft", icon: Clock, color: "text-white/50 bg-white/10" },
  analyzing: { label: "Analyzing...", icon: Loader2, color: "text-[#D4AF37] bg-[#D4AF37]/10", spin: true },
  complete: { label: "Complete", icon: CheckCircle, color: "text-emerald-400 bg-emerald-400/10" },
  error: { label: "Error", icon: AlertCircle, color: "text-red-400 bg-red-400/10" },
};

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatSqFt(n: number | null) {
  if (!n) return "—";
  return n.toLocaleString() + " sq ft";
}

// ─── Welcome Modal ────────────────────────────────────────────
function WelcomeModal({ plan, onClose }: { plan: string | null; onClose: () => void }) {
  const planName = plan
    ? plan.charAt(0).toUpperCase() + plan.slice(1)
    : "Starter";

  const steps = [
    {
      icon: Upload,
      title: "Upload Your First Floor Plan",
      desc: "Click \"New Project\" and upload a PDF, JPG, or PNG floor plan from any property you're touring.",
    },
    {
      icon: Sparkles,
      title: "Let AI Generate 3 Scenarios",
      desc: "Enter headcount and industry. Leasibility AI instantly produces Light Refresh, Moderate Build-Out, and Full Transformation plans — each with layouts, budgets, and timelines.",
    },
    {
      icon: Share2,
      title: "Share a Branded Report",
      desc: "Export a PDF or shareable link with your name and contact info. Know the moment your client opens it.",
    },
    {
      icon: Bell,
      title: "Read Receipts & Follow-Ups",
      desc: "You'll get notified when your client views the report — perfect timing for a follow-up call.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0F1F3D] border border-[#D4AF37]/30 rounded-3xl shadow-2xl shadow-black/60 w-full max-w-2xl overflow-hidden">
        {/* Gold top bar */}
        <div className="h-1 bg-gradient-to-r from-[#D4AF37] via-[#f0d060] to-[#D4AF37]" />

        <div className="p-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
              <Sparkles size={26} className="text-[#D4AF37]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-3 py-1 mb-1">
                <CheckCircle size={11} className="text-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-wider">
                  {planName} Plan Active
                </span>
              </div>
              <h2 className="font-['Montserrat'] font-black text-2xl text-white leading-tight">
                Welcome to Leasibility AI
              </h2>
              <p className="text-white/50 font-['Inter'] text-sm mt-0.5">
                Your 7-day free trial has started. Here's how to get the most out of it.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className="bg-[#0A1628] border border-white/8 rounded-2xl p-4 flex gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <step.icon size={16} className="text-[#D4AF37]" />
                </div>
                <div>
                  <div className="font-['Montserrat'] font-700 text-white text-sm mb-1">{step.title}</div>
                  <div className="text-white/45 font-['Inter'] text-xs leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-800 text-sm py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Start My First Project
            <ArrowRight size={16} />
          </button>

          <p className="text-center text-white/25 font-['Inter'] text-xs mt-3">
            Trial ends in 7 days. No charge until you choose to continue.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Trial Expiry Banner ──────────────────────────────────────
function TrialExpiryBanner({ trialEndsAt }: { trialEndsAt: Date }) {
  const [dismissed, setDismissed] = useState(false);
  const [, navigate] = useLocation();

  if (dismissed) return null;

  const now = new Date();
  const msLeft = trialEndsAt.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const hoursLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60)));

  // Only show if ≤ 3 days remaining
  if (daysLeft > 3) return null;

  const timeLabel =
    daysLeft === 0
      ? hoursLeft <= 1
        ? "less than 1 hour"
        : `${hoursLeft} hours`
      : daysLeft === 1
      ? "1 day"
      : `${daysLeft} days`;

  const urgency = daysLeft === 0 ? "red" : daysLeft === 1 ? "amber" : "gold";

  const colors = {
    red: {
      bg: "bg-red-950/60 border-red-500/40",
      icon: "text-red-400",
      text: "text-red-300",
      badge: "bg-red-500/20 text-red-300 border-red-500/30",
      btn: "bg-red-500 hover:bg-red-400 text-white",
    },
    amber: {
      bg: "bg-amber-950/60 border-amber-500/40",
      icon: "text-amber-400",
      text: "text-amber-300",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      btn: "bg-amber-500 hover:bg-amber-400 text-[#0F1F3D]",
    },
    gold: {
      bg: "bg-[#D4AF37]/10 border-[#D4AF37]/30",
      icon: "text-[#D4AF37]",
      text: "text-[#D4AF37]",
      badge: "bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30",
      btn: "bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D]",
    },
  }[urgency];

  return (
    <div className={`border rounded-2xl px-5 py-4 mb-6 flex items-center gap-4 ${colors.bg}`}>
      <div className={`shrink-0 ${colors.icon}`}>
        <AlertTriangle size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-['Montserrat'] font-700 text-sm text-white`}>
            Your free trial expires in{" "}
            <span className={colors.text}>{timeLabel}</span>
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-['Montserrat'] font-600 ${colors.badge}`}>
            {daysLeft === 0 ? "Expiring today" : `${daysLeft}d left`}
          </span>
        </div>
        <p className="text-white/45 font-['Inter'] text-xs mt-0.5">
          Upgrade now to keep your projects, reports, and client data — no interruption.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate("/billing")}
          className={`font-['Montserrat'] font-700 text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${colors.btn}`}
        >
          Upgrade Now <ArrowRight size={12} />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: brokerProfile, isLoading: profileLoading } = trpc.broker.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: subscription } = trpc.billing.getSubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Safe redirect — never navigate during render (prevents React error #310)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  const claimReferral = trpc.referral.claimReferral.useMutation();

  // Auto-claim any pending referral code stored from the /join page
  useEffect(() => {
    if (!isAuthenticated) return;
    const pendingCode = sessionStorage.getItem("pendingReferralCode");
    if (pendingCode) {
      sessionStorage.removeItem("pendingReferralCode");
      claimReferral.mutate({ referralCode: pendingCode });
    }
  }, [isAuthenticated]);

  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Project deleted."); setDeletingId(null); },
    onError: () => { toast.error("Failed to delete project."); setDeletingId(null); },
  });

  // Show welcome modal if redirected from Stripe checkout success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") {
      setShowWelcome(true);
      // Clean up the URL without reloading
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, []);

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

  const completeCount = projects?.filter(p => p.status === "complete").length ?? 0;
  const draftCount = projects?.filter(p => p.status === "draft" || p.status === "analyzing").length ?? 0;

  // Determine if trial expiry banner should show
  const trialEndsAt = subscription?.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
  const showTrialBanner =
    subscription?.trialActive &&
    trialEndsAt !== null &&
    trialEndsAt.getTime() - Date.now() <= 3 * 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Welcome Modal */}
      {showWelcome && (
        <WelcomeModal
          plan={subscription?.plan ?? null}
          onClose={() => { setShowWelcome(false); navigate("/new"); }}
        />
      )}

      {/* Top Nav */}
      <header className="border-b border-white/8 bg-[#0A1628]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={CDN_ICON} alt="Leasibility AI" className="w-8 h-8 rounded-xl" />
            <span className="font-['Montserrat'] font-800 text-lg text-white">
              Leasibility <span className="text-[#D4AF37]">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/new")}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-700 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} className="sm:hidden" />
              <Plus size={16} className="hidden sm:block" />
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </button>
            <button
              onClick={() => navigate("/compare")}
              className="hidden sm:flex items-center gap-2 border border-white/15 hover:border-[#D4AF37]/40 text-white/70 hover:text-white font-['Montserrat'] font-600 text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <GitCompare size={16} />
              Compare
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center hover:bg-[#D4AF37]/30 transition-colors"
              >
                <User size={16} className="text-[#D4AF37]" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 w-52 bg-[#0F1F3D] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                  <div className="px-4 py-3 border-b border-white/8">
                    <p className="text-white text-sm font-['Montserrat'] font-600 truncate">{user?.name ?? "Broker"}</p>
                    <p className="text-white/40 text-xs font-['Inter'] truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm font-['Inter'] transition-colors"
                  >
                    <User size={14} /> Broker Profile
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/billing"); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm font-['Inter'] transition-colors"
                  >
                    <CreditCard size={14} /> Subscription & Billing
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/referrals"); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[#D4AF37]/80 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 text-sm font-['Inter'] transition-colors"
                  >
                    <Gift size={14} /> Referral Program
                  </button>
                  <button
                    onClick={() => { logout(); navigate("/"); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm font-['Inter'] transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-['Montserrat'] font-black text-xl sm:text-2xl md:text-3xl text-white mb-1">
            Good {getGreeting()}, {firstName(user?.name)}.
          </h1>
          <p className="text-white/50 font-['Inter'] text-sm">
            Your space intelligence dashboard — all active projects in one place.
          </p>
        </div>

        {/* Trial Expiry Banner */}
        {showTrialBanner && trialEndsAt && (
          <TrialExpiryBanner trialEndsAt={trialEndsAt} />
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: "Total Projects", value: projects?.length ?? 0, icon: Building2 },
            { label: "Reports Ready", value: completeCount, icon: FileText },
            { label: "In Progress", value: draftCount, icon: BarChart3 },
          ].map((s, i) => (
            <div key={i} className="bg-[#0F1F3D] border border-white/8 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                <s.icon size={15} className="text-[#D4AF37] sm:hidden" />
                <s.icon size={18} className="text-[#D4AF37] hidden sm:block" />
              </div>
              <div className="text-center sm:text-left">
                <div className="font-['Montserrat'] font-black text-xl sm:text-2xl text-white leading-none">{s.value}</div>
                <div className="text-white/40 text-[10px] sm:text-xs font-['Inter'] mt-0.5 leading-tight">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Montserrat'] font-700 text-white text-lg">Projects</h2>
          <button
            onClick={() => navigate("/new")}
            className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#c49b2e] text-sm font-['Inter'] transition-colors"
          >
            <Plus size={14} /> New Project
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
          </div>
        ) : !projects || projects.length === 0 ? (
          <EmptyState onNew={() => navigate("/new")} />
        ) : (
          <div className="space-y-3">
            {projects.map(project => {
              const cfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.draft;
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={project.id}
                  className="group bg-[#0F1F3D] border border-white/8 hover:border-[#D4AF37]/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 cursor-pointer transition-all duration-200"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  {/* Floor plan thumbnail or placeholder */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-[#0A1628] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {project.floorPlanUrl ? (
                      <img src={project.floorPlanUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={22} className="text-white/20" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-['Montserrat'] font-700 text-white text-sm truncate max-w-[140px] sm:max-w-none">{project.propertyName}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-['Inter'] ${cfg.color}`}>
                        <StatusIcon size={10} className={(cfg as any).spin ? "animate-spin" : ""} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-white/40 text-xs font-['Inter']">
                      {project.propertyAddress && <span className="truncate max-w-[160px] sm:max-w-[200px]">{project.propertyAddress}</span>}
                      {project.totalSqFt && <span className="hidden sm:inline">{formatSqFt(project.totalSqFt)}</span>}
                      {project.headcount && <span className="hidden sm:inline">{project.headcount} people</span>}
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {(project as any).viewCount > 0 && (
                      <span className="hidden sm:flex items-center gap-1 text-[#D4AF37] text-xs font-['Inter'] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-1 rounded-full">
                        <Eye size={10} /> {(project as any).viewCount} view{(project as any).viewCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm("Delete this project?")) {
                          setDeletingId(project.id);
                          deleteProject.mutate({ id: project.id });
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {deletingId === project.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                    <ChevronRight size={16} className="text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="bg-[#0F1F3D] border border-white/8 border-dashed rounded-2xl p-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-5">
        <Building2 size={28} className="text-[#D4AF37]" />
      </div>
      <h3 className="font-['Montserrat'] font-700 text-white text-lg mb-2">No projects yet</h3>
      <p className="text-white/40 font-['Inter'] text-sm mb-6 max-w-xs mx-auto">
        Start your first space analysis. Upload a floor plan or scan a space during your next tour.
      </p>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-700 text-sm px-6 py-3 rounded-xl transition-colors"
      >
        <Plus size={16} /> Start New Project
      </button>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function firstName(name?: string | null) {
  if (!name) return "there";
  return name.split(" ")[0];
}
