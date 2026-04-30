import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, MapPin, TrendingUp, CheckCircle,
  ArrowRight, Loader2, Zap
} from "lucide-react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

// ─── Step Data ────────────────────────────────────────────────────────────────

const ROLES = [
  { value: "tenant_rep", label: "Tenant Rep Broker", icon: "🏢" },
  { value: "landlord_rep", label: "Landlord Rep Broker", icon: "🏗️" },
  { value: "principal", label: "Principal / Team Lead", icon: "👔" },
  { value: "corporate_re", label: "Corporate Real Estate", icon: "🏛️" },
  { value: "other", label: "Other", icon: "💼" },
];

const DEAL_VOLUMES = [
  { value: "1_5", label: "1–5 deals / year" },
  { value: "6_15", label: "6–15 deals / year" },
  { value: "16_30", label: "16–30 deals / year" },
  { value: "30_plus", label: "30+ deals / year" },
];

const MARKETS = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Dallas, TX",
  "Houston, TX", "San Francisco, CA", "Boston, MA", "Washington, DC",
  "Atlanta, GA", "Seattle, WA", "Miami, FL", "Denver, CO",
  "Austin, TX", "Phoenix, AZ", "Philadelphia, PA", "Other",
];

const PAIN_POINTS = [
  { value: "budget_estimates", label: "Providing budget estimates on the spot", icon: "💰" },
  { value: "test_fit_speed", label: "Getting a test-fit done quickly", icon: "⚡" },
  { value: "client_reporting", label: "Creating professional client reports", icon: "📄" },
  { value: "schedule_forecasting", label: "Forecasting project timelines", icon: "📅" },
  { value: "differentiating", label: "Standing out from competing brokers", icon: "🏆" },
];

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["10 analyses/month", "PDF + shareable links", "Branded reports", "Budget estimator"],
  professional: ["Unlimited analyses", "White-label reports", "Read receipts", "Property comparison", "Priority support"],
  team: ["Everything in Professional", "Co-broker sharing", "Team project visibility", "Dedicated onboarding"],
};

// ─── Onboarding Component ─────────────────────────────────────────────────────

export default function Onboarding() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [role, setRole] = useState("");
  const [dealVolume, setDealVolume] = useState("");
  const [primaryMarket, setPrimaryMarket] = useState("");
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("professional");

  const saveProfile = trpc.broker.saveProfile.useMutation();
  const createCheckoutSession = trpc.billing.createCheckoutSession.useMutation();

  const totalSteps = 4;
  const progress = ((step) / totalSteps) * 100;

  function togglePain(val: string) {
    setPainPoints(prev =>
      prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]
    );
  }

  async function handleFinish() {
    setSaving(true);
    try {
      // Save broker profile with onboarding data
      await saveProfile.mutateAsync({
        brokerName: user?.name ?? "",
        title: ROLES.find(r => r.value === role)?.label ?? "",
        onboardingCompleted: true,
        onboardingRole: role,
        onboardingDealVolume: dealVolume,
        onboardingMarket: primaryMarket,
        onboardingPainPoints: painPoints.join(","),
      });

      // Push to GHL (non-blocking)
      fetch("/api/ghl/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: user?.name?.split(" ")[0] ?? "",
          email: user?.email ?? "",
          onboardingRole: role,
          onboardingDealVolume: dealVolume,
          onboardingMarket: primaryMarket,
          onboardingPainPoints: painPoints.join(","),
          planSelected: selectedPlan,
          source: "onboarding-survey",
          tag: "trial-started",
        }),
      }).catch(() => {}); // Fire-and-forget

      // Redirect to Stripe Checkout in same tab (card-required trial)
      if (selectedPlan !== "free") {
        const result = await createCheckoutSession.mutateAsync({
          plan: selectedPlan as "starter" | "professional" | "team",
          interval: "month",
          origin: window.location.origin,
        });
        if (result.url) {
          // Same tab — keeps user in the funnel
          window.location.href = result.url;
          return;
        }
      }
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <img src={CDN_ICON} alt="Leasibility AI" className="w-9 h-9 rounded-xl" />
        <span className="font-['Montserrat'] font-black text-xl text-white tracking-tight">
          Leasibility <span className="text-[#D4AF37]">AI</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between text-xs font-['Inter'] text-white/30 mb-2">
          <span>Getting started</span>
          <span>Step {step + 1} of {totalSteps}</span>
        </div>
        <div className="h-1 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#D4AF37] rounded-full"
            animate={{ width: `${progress + 25}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* ── Step 0: Role ── */}
          {step === 0 && (
            <motion.div key="step0" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className="bg-[#0F1F3D] border border-white/8 rounded-3xl p-8">
                <div className="mb-6">
                  <p className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest mb-2">Welcome, {user?.name?.split(" ")[0] ?? "there"}</p>
                  <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-2">What best describes your role?</h2>
                  <p className="text-white/45 font-['Inter'] text-sm">This helps us tailor your experience and default report settings.</p>
                </div>
                <div className="space-y-3">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                        role === r.value
                          ? "border-[#D4AF37]/60 bg-[#D4AF37]/8 text-white"
                          : "border-white/8 bg-white/2 text-white/60 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="text-lg">{r.icon}</span>
                      <span className="font-['Inter'] text-sm font-500">{r.label}</span>
                      {role === r.value && <CheckCircle size={15} className="text-[#D4AF37] ml-auto" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  disabled={!role}
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] disabled:opacity-40 text-[#0F1F3D] font-['Montserrat'] font-700 text-sm px-6 py-3.5 rounded-xl transition-colors"
                >
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Deal Volume + Market ── */}
          {step === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className="bg-[#0F1F3D] border border-white/8 rounded-3xl p-8">
                <div className="mb-6">
                  <p className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest mb-2">Your Practice</p>
                  <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-2">How active is your deal pipeline?</h2>
                  <p className="text-white/45 font-['Inter'] text-sm">We use this to recommend the right plan and set your usage defaults.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {DEAL_VOLUMES.map(d => (
                    <button
                      key={d.value}
                      onClick={() => setDealVolume(d.value)}
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border text-sm font-['Inter'] transition-all ${
                        dealVolume === d.value
                          ? "border-[#D4AF37]/60 bg-[#D4AF37]/8 text-white"
                          : "border-white/8 bg-white/2 text-white/50 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {dealVolume === d.value && <CheckCircle size={13} className="text-[#D4AF37] shrink-0" />}
                      {d.label}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-white/50 text-xs font-['Inter'] mb-2">
                    <MapPin size={11} className="inline mr-1" />Primary Market
                  </label>
                  <select
                    value={primaryMarket}
                    onChange={e => setPrimaryMarket(e.target.value)}
                    className="w-full bg-[#0A1628] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-['Inter'] focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
                  >
                    <option value="">Select your primary market...</option>
                    {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/50 hover:text-white font-['Inter'] text-sm transition-colors">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!dealVolume || !primaryMarket}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] disabled:opacity-40 text-[#0F1F3D] font-['Montserrat'] font-700 text-sm py-3.5 rounded-xl transition-colors"
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Pain Points ── */}
          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className="bg-[#0F1F3D] border border-white/8 rounded-3xl p-8">
                <div className="mb-6">
                  <p className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest mb-2">Your Challenges</p>
                  <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-2">What slows you down the most?</h2>
                  <p className="text-white/45 font-['Inter'] text-sm">Select all that apply. We will prioritize these features in your experience.</p>
                </div>
                <div className="space-y-3 mb-6">
                  {PAIN_POINTS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => togglePain(p.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                        painPoints.includes(p.value)
                          ? "border-[#D4AF37]/60 bg-[#D4AF37]/8 text-white"
                          : "border-white/8 bg-white/2 text-white/60 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span className="font-['Inter'] text-sm flex-1">{p.label}</span>
                      {painPoints.includes(p.value) && <CheckCircle size={15} className="text-[#D4AF37] shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/50 hover:text-white font-['Inter'] text-sm transition-colors">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={painPoints.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] disabled:opacity-40 text-[#0F1F3D] font-['Montserrat'] font-700 text-sm py-3.5 rounded-xl transition-colors"
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Plan Selection ── */}
          {step === 3 && (
            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className="bg-[#0F1F3D] border border-white/8 rounded-3xl p-8">
                <div className="mb-6">
                  <p className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest mb-2">Almost There</p>
                  <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-2">Choose your plan</h2>
                  <p className="text-white/45 font-['Inter'] text-sm">
                    {dealVolume === "16_30" || dealVolume === "30_plus"
                      ? "Based on your deal volume, Professional is the right fit for you."
                      : "Start free for 7 days. No credit card required to explore."}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {(["starter", "professional", "team"] as const).map(plan => (
                    <button
                      key={plan}
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full flex items-start gap-4 px-4 py-4 rounded-xl border text-left transition-all relative ${
                        selectedPlan === plan
                          ? "border-[#D4AF37]/60 bg-[#D4AF37]/8"
                          : "border-white/8 bg-white/2 hover:border-white/20"
                      }`}
                    >
                      {plan === "professional" && (
                        <span className="absolute -top-2.5 left-4 bg-[#D4AF37] text-[#0F1F3D] text-xs font-['Montserrat'] font-800 uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-['Montserrat'] font-700 text-white text-sm capitalize">{plan}</span>
                          <span className="font-['Montserrat'] font-black text-white text-sm">
                            {plan === "starter" ? "$99" : plan === "professional" ? "$199" : "$149"}<span className="text-white/30 text-xs font-normal">/mo</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {PLAN_FEATURES[plan].slice(0, 3).map(f => (
                            <span key={f} className="text-white/40 text-xs font-['Inter']">• {f}</span>
                          ))}
                        </div>
                      </div>
                      {selectedPlan === plan && <CheckCircle size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />}
                    </button>
                  ))}
                </div>

                {/* Value reminder */}
                <div className="flex items-center gap-2 bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-xl px-4 py-3 mb-6">
                  <Zap size={14} className="text-[#D4AF37] shrink-0" />
                  <p className="text-white/60 text-xs font-['Inter']">
                    7-day free trial on all plans. Cancel anytime. No commitment.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/50 hover:text-white font-['Inter'] text-sm transition-colors">
                    Back
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] disabled:opacity-60 text-[#0F1F3D] font-['Montserrat'] font-700 text-sm py-3.5 rounded-xl transition-colors"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <TrendingUp size={15} />}
                    {saving ? "Setting up..." : "Start Free Trial"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap items-center justify-center gap-5 mt-8 text-white/25 text-xs font-['Inter']">
        <span className="flex items-center gap-1.5"><CheckCircle size={11} className="text-[#D4AF37]/50" /> No credit card required to start</span>
        <span className="flex items-center gap-1.5"><CheckCircle size={11} className="text-[#D4AF37]/50" /> Cancel anytime</span>
        <span className="flex items-center gap-1.5"><CheckCircle size={11} className="text-[#D4AF37]/50" /> Built for tenant rep brokers</span>
      </div>
    </div>
  );
}
