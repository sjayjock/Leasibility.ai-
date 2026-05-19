import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { ArrowRight, Zap, Play, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

export default function Start() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Preserve plan/interval params so billing page can auto-trigger checkout after login
  const urlParams = new URLSearchParams(window.location.search);
  const planParam = urlParams.get("plan");
  const intervalParam = urlParams.get("interval");

  // If already logged in, send straight to onboarding (or billing if plan selected)
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (planParam) {
        navigate(`/billing?plan=${planParam}&interval=${intervalParam ?? "month"}`);
      } else {
        navigate("/onboarding");
      }
    }
  }, [loading, isAuthenticated, navigate, planParam, intervalParam]);

  const handleSignUp = () => {
    const returnPath = planParam
      ? `/billing?plan=${planParam}&interval=${intervalParam ?? "month"}`
      : "/onboarding";
    window.location.href = getLoginUrl(returnPath);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/8 bg-[#0A1628]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src={CDN_ICON} alt="Leasibility AI" className="w-8 h-8 rounded-xl" />
            <span className="font-['Montserrat'] font-800 text-white text-base">
              Leasibility <span className="text-[#D4AF37]">AI</span>
            </span>
          </a>
          <button
            onClick={handleSignUp}
            className="text-white/60 hover:text-white text-sm font-['Inter'] transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">
                Built for Tenant Rep Brokers
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-['Montserrat'] font-black text-3xl md:text-4xl text-white leading-tight mb-3">
              Want to see how it works first?
            </h1>
            <p className="text-white/55 font-['Inter'] text-base mb-10 leading-relaxed">
              Try a live demo — no login needed — or jump straight into your free trial.
            </p>

            {/* Two-button choice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Option A: Try Demo */}
              <a
                href="/demo"
                className="group relative bg-white/4 border border-white/12 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/6 rounded-2xl p-6 text-left transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/12 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                  <Play size={18} className="text-[#D4AF37]" />
                </div>
                <div className="font-['Montserrat'] font-800 text-white text-base mb-1.5">
                  Try Sample Deal
                </div>
                <div className="text-white/45 font-['Inter'] text-sm leading-relaxed">
                  See a real test fit, budget, and timeline — no account needed.
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[#D4AF37] text-xs font-['Montserrat'] font-700">
                  No login required
                  <ArrowRight size={12} />
                </div>
              </a>

              {/* Option B: Continue to Signup */}
              <button
                onClick={handleSignUp}
                className="group relative bg-[#D4AF37] hover:bg-[#C9A227] rounded-2xl p-6 text-left transition-all duration-200 shadow-lg shadow-[#D4AF37]/20"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0F1F3D]/30 flex items-center justify-center mb-4">
                  <Zap size={18} className="text-[#0F1F3D]" />
                </div>
                <div className="font-['Montserrat'] font-800 text-[#0F1F3D] text-base mb-1.5">
                  Start Free Trial
                </div>
                <div className="text-[#0F1F3D]/65 font-['Inter'] text-sm leading-relaxed">
                  7 days free. Run it on your own deals immediately.
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[#0F1F3D] text-xs font-['Montserrat'] font-700">
                  Continue to signup
                  <ArrowRight size={12} />
                </div>
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-5 flex-wrap">
              {["7-day free trial", "Cancel anytime", "Results in 60 seconds"].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 text-white/35 text-xs font-['Inter']">
                  <CheckCircle size={11} className="text-[#D4AF37]/50" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/8 py-5">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-white/30 text-xs font-['Inter']">
          <span>© 2025 Leasibility AI. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="/security" className="hover:text-white/60 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </div>
  );
}
