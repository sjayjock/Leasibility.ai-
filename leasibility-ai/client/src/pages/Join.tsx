import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  CheckCircle, ArrowRight, Loader2, Gift, Users, Zap,
  BarChart3, FileText, Clock, Star
} from "lucide-react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

// Look up who owns a referral code so we can show their name
function useReferrerInfo(code: string | null) {
  return trpc.referral.getReferrerByCode.useQuery(
    { code: code ?? "" },
    { enabled: !!code, retry: false }
  );
}

export default function Join() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const refCode = params.get("ref");

  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: referrerData, isLoading: referrerLoading } = useReferrerInfo(refCode);

  // Persist the ref code so we can claim it after OAuth redirect
  useEffect(() => {
    if (refCode) {
      sessionStorage.setItem("pendingReferralCode", refCode);
    }
  }, [refCode]);

  // If already signed in, claim the referral immediately and go to dashboard
  const claimReferral = trpc.referral.claimReferral.useMutation();
  useEffect(() => {
    if (!authLoading && isAuthenticated && refCode) {
      claimReferral.mutate(
        { referralCode: refCode },
        { onSettled: () => navigate("/dashboard") }
      );
    }
  }, [isAuthenticated, authLoading, refCode]);

  const features = [
    { icon: Zap, text: "AI generates 3 build scenarios in under 60 seconds" },
    { icon: BarChart3, text: "Market-calibrated budgets with low/mid/high ranges" },
    { icon: FileText, text: "Branded PDF reports with your name and contact info" },
    { icon: Clock, text: "Project timelines from lease execution to move-in" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  const referrerName = referrerData?.name ?? null;
  const isValidCode = !!refCode && (referrerLoading || !!referrerData);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-white/8 bg-[#0A1628]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={CDN_ICON} alt="Leasibility AI" className="w-8 h-8 rounded-xl" />
            <span className="font-['Montserrat'] font-800 text-lg text-white">
              Leasibility <span className="text-[#D4AF37]">AI</span>
            </span>
          </div>
          <a
            href="/#pricing"
            className="text-white/50 hover:text-white font-['Inter'] text-sm transition-colors"
          >
            View Pricing
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Referral acknowledgement + CTA */}
          <div>
            {/* Referral badge */}
            {isValidCode && (
              <div className="inline-flex items-center gap-2.5 bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-2xl px-4 py-3 mb-7">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                  <Gift size={14} className="text-[#D4AF37]" />
                </div>
                <div>
                  {referrerLoading ? (
                    <p className="text-white/50 font-['Inter'] text-sm">Loading referral...</p>
                  ) : referrerName ? (
                    <>
                      <p className="text-[#D4AF37] font-['Montserrat'] font-700 text-sm">
                        {referrerName} invited you
                      </p>
                      <p className="text-white/45 font-['Inter'] text-xs">
                        You both get a free month when you subscribe
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[#D4AF37] font-['Montserrat'] font-700 text-sm">
                        You've been invited
                      </p>
                      <p className="text-white/45 font-['Inter'] text-xs">
                        Start your free 7-day trial below
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Headline */}
            <h1 className="font-['Montserrat'] font-black text-3xl md:text-4xl text-white leading-tight mb-4">
              Know If a Space Works—<br />
              <span className="text-[#D4AF37]">Before Your Client Asks.</span>
            </h1>

            <p className="text-white/60 font-['Inter'] text-lg leading-relaxed mb-8">
              Upload a floor plan or scan the space on-site. Leasibility AI instantly generates three build scenarios — Light Refresh, Moderate Build-Out, and Full Transformation — each with layouts, market-calibrated budgets, and clear timelines. Walk out of every showing with answers your client can act on.
            </p>

            {/* Trial CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href={getLoginUrl()}
                className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-800 text-sm px-8 py-4 rounded-xl transition-colors"
              >
                Start Your 7-Day Free Trial
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-5 text-white/40 text-xs font-['Inter']">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-[#D4AF37]" />
                No credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-[#D4AF37]" />
                Results in under 60 seconds
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-[#D4AF37]" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Right: Feature list + social proof */}
          <div className="space-y-4">
            {/* Feature cards */}
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-[#0F1F3D] border border-white/8 rounded-2xl p-4"
              >
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <f.icon size={16} className="text-[#D4AF37]" />
                </div>
                <p className="text-white/70 font-['Inter'] text-sm leading-relaxed pt-1.5">{f.text}</p>
              </div>
            ))}

            {/* Testimonial */}
            <div className="bg-[#0F1F3D] border border-white/8 rounded-2xl p-5 mt-2">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={12} fill="#D4AF37" className="text-[#D4AF37]" />
                ))}
              </div>
              <p className="text-white/65 font-['Inter'] text-sm leading-relaxed mb-3">
                "I sent a test-fit and budget estimate to my client before I even got back to my car. That kind of speed changes the conversation entirely."
              </p>
              <div>
                <p className="text-white font-['Montserrat'] font-700 text-xs">Michael T.</p>
                <p className="text-white/35 font-['Inter'] text-xs">Tenant Rep Broker, Chicago</p>
              </div>
            </div>

            {/* Referral code display */}
            {refCode && (
              <div className="flex items-center justify-between bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-[#D4AF37]" />
                  <span className="text-white/40 font-['Inter'] text-xs">Referral code applied:</span>
                </div>
                <span className="font-['Montserrat'] font-700 text-[#D4AF37] text-xs tracking-wider">{refCode}</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/8 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 font-['Inter'] text-xs">
            © 2026 CREEL Solutions LLC. All rights reserved.
          </p>
          <p className="text-white/15 font-['Inter'] text-xs">
            AI-generated estimates are approximations for feasibility only, not professional contractor bids.
          </p>
        </div>
      </footer>
    </div>
  );
}
