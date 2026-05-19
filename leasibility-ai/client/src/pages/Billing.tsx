import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  CheckCircle, Zap, Crown, Users, ArrowLeft, ExternalLink,
  Loader2, Star, Shield, Clock, ArrowRight, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  starter: <Zap size={20} className="text-[#D4AF37]" />,
  professional: <Crown size={20} className="text-[#D4AF37]" />,
  team: <Users size={20} className="text-[#D4AF37]" />,
};

const TRUST_SIGNALS = [
  { icon: Shield, text: "256-bit SSL encryption" },
  { icon: Lock, text: "Secured by Stripe" },
  { icon: Clock, text: "Cancel anytime" },
];

export default function Billing() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Read plan/interval from URL query params (e.g. /billing?plan=professional&interval=year)
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const urlPlan = urlParams.get("plan");
  const urlInterval = urlParams.get("interval");

  // Safe redirect — never navigate during render (prevents React error #310)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  const { data: plans, isLoading: plansLoading } = trpc.billing.getPlans.useQuery();
  const { data: subscription, isLoading: subLoading } = trpc.billing.getSubscription.useQuery();

  const checkoutMutation = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to secure checkout...");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const portalMutation = trpc.billing.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_blank");
    },
    onError: (err) => toast.error(err.message),
  });

  if (authLoading || plansLoading || subLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
      </div>
    );
  }

  // Auto-trigger checkout if plan was passed from landing page
  useEffect(() => {
    if (!isAuthenticated || authLoading || plansLoading || subLoading) return;
    if (autoTriggered) return;
    if (!urlPlan || !["starter", "professional", "team"].includes(urlPlan)) return;
    if (subscription?.isActive) return;

    setAutoTriggered(true);
    const isAnnual = urlInterval === "year";
    setAnnual(isAnnual);
    setSelectedPlan(urlPlan);
    checkoutMutation.mutate({
      plan: urlPlan as "starter" | "professional" | "team",
      interval: isAnnual ? "year" : "month",
      origin: window.location.origin,
    });
  }, [isAuthenticated, authLoading, plansLoading, subLoading, autoTriggered, urlPlan, urlInterval, subscription]);

  const handleSelectPlan = (planKey: string) => {
    if (!user) return;
    setSelectedPlan(planKey);
    checkoutMutation.mutate({
      plan: planKey as "starter" | "professional" | "team",
      interval: annual ? "year" : "month",
      origin: window.location.origin,
    });
  };

  const handleManageBilling = () => {
    portalMutation.mutate({ origin: window.location.origin });
  };

  const isActive = subscription?.isActive;
  const currentPlan = subscription?.plan;

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Top Nav */}
      <div className="border-b border-white/8 bg-[#0A1628]/95 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm font-['Inter']"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          <span className="font-['Montserrat'] font-700 text-white text-sm sm:text-base">Choose Your Plan</span>
          <div className="w-16 sm:w-24" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Current Status Banner */}
        {isActive && (
          <div className="mb-8 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                <CheckCircle size={18} className="text-[#D4AF37]" />
              </div>
              <div>
                <div className="font-['Montserrat'] font-700 text-white capitalize text-sm sm:text-base">
                  {currentPlan} Plan — {subscription?.trialActive ? "Trial Active" : "Active"}
                </div>
                <div className="text-white/50 text-xs sm:text-sm font-['Inter']">
                  {subscription?.trialActive && subscription?.trialEndsAt
                    ? `Trial ends ${new Date(subscription.trialEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                    : subscription?.subscriptionEndsAt
                    ? `Renews ${new Date(subscription.subscriptionEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                    : ""}
                </div>
              </div>
            </div>
            <Button
              onClick={handleManageBilling}
              disabled={portalMutation.isPending}
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
            >
              {portalMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <ExternalLink size={13} />}
              Manage Billing
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-600 uppercase tracking-widest">7-Day Free Trial</span>
          </div>
          <h1 className="font-['Montserrat'] font-black text-2xl sm:text-3xl md:text-4xl text-white mb-2 sm:mb-3">
            Start Closing Deals Faster
          </h1>
          <p className="text-white/55 font-['Inter'] text-sm sm:text-base max-w-md mx-auto">
            No credit card required. Full access for 7 days. Cancel anytime.
          </p>

          {/* Annual Toggle */}
          <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 mt-6">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-['Montserrat'] font-600 transition-all ${
                !annual ? "bg-[#D4AF37] text-[#0F1F3D] shadow-sm" : "text-white/55 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-['Montserrat'] font-600 transition-all flex items-center gap-1.5 ${
                annual ? "bg-[#D4AF37] text-[#0F1F3D] shadow-sm" : "text-white/55 hover:text-white"
              }`}
            >
              Annual
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-700 ${annual ? "bg-[#0F1F3D]/20" : "bg-[#D4AF37]/20 text-[#D4AF37]"}`}>
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
          {(plans ?? []).map((plan) => {
            const isPopular = plan.key === "professional";
            const isCurrent = currentPlan === plan.key && isActive;
            const price = annual
              ? Math.round(plan.annualPrice / 12 / 100)
              : Math.round(plan.monthlyPrice / 100);
            const annualTotal = Math.round(plan.annualPrice / 100);

            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-200 ${
                  isPopular
                    ? "bg-gradient-to-b from-[#1A2B4A] to-[#0F1F3D] border-2 border-[#D4AF37]/50 shadow-2xl shadow-[#D4AF37]/10 sm:-mt-2 sm:mb-2"
                    : "bg-[#0D1B35] border border-white/10 hover:border-white/20"
                }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="bg-[#D4AF37] text-[#0F1F3D] text-xs font-['Montserrat'] font-800 uppercase tracking-wider px-4 py-2 flex items-center justify-center gap-1.5">
                    <Star size={10} fill="currentColor" />
                    Most Popular — Best Value
                  </div>
                )}
                {isCurrent && !isPopular && (
                  <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-400 text-xs font-['Montserrat'] font-700 uppercase tracking-wider px-4 py-2 flex items-center justify-center">
                    Your Current Plan
                  </div>
                )}

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  {/* Plan header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                      {PLAN_ICONS[plan.key]}
                    </div>
                    <h3 className="font-['Montserrat'] font-800 text-white text-lg">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-['Montserrat'] font-black text-3xl sm:text-4xl text-white">${price}</span>
                      <span className="text-white/40 text-sm font-['Inter']">
                        {plan.key === "team" ? "/user/mo" : "/mo"}
                      </span>
                    </div>
                    {annual ? (
                      <div className="text-[#D4AF37] text-xs font-['Inter'] mt-0.5">
                        ${annualTotal}/yr — 2 months free
                      </div>
                    ) : (
                      <div className="text-white/30 text-xs font-['Inter'] mt-0.5">
                        or ${annualTotal}/yr (save 17%)
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 my-5 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs sm:text-sm font-['Inter'] text-white/70">
                        <CheckCircle size={13} className="text-[#D4AF37] mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => isCurrent ? handleManageBilling() : handleSelectPlan(plan.key)}
                    disabled={checkoutMutation.isPending && selectedPlan === plan.key}
                    className={`w-full py-3.5 rounded-xl text-sm font-['Montserrat'] font-700 uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                      isPopular
                        ? "bg-[#D4AF37] text-[#0F1F3D] hover:bg-[#c9a430] shadow-lg shadow-[#D4AF37]/20"
                        : "border border-white/20 text-white hover:border-[#D4AF37]/50 hover:bg-white/5"
                    } disabled:opacity-60`}
                  >
                    {checkoutMutation.isPending && selectedPlan === plan.key ? (
                      <><Loader2 size={14} className="animate-spin" /> Processing...</>
                    ) : isCurrent ? (
                      <>Manage Plan <ExternalLink size={13} /></>
                    ) : (
                      <>Start Free Trial <ArrowRight size={13} /></>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8 sm:mt-10">
          {TRUST_SIGNALS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-white/35 text-xs font-['Inter']">
              <s.icon size={13} className="text-white/30" />
              {s.text}
            </div>
          ))}
        </div>

        {/* Enterprise Note */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-white/35 font-['Inter'] text-xs sm:text-sm">
            Need a custom Enterprise plan for a large brokerage?{" "}
            <a href="mailto:hello@leasibility.ai" className="text-[#D4AF37] hover:underline">
              Contact us for custom pricing.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
