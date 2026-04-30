import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Gift, Copy, Check, Users, Star, ArrowLeft, Loader2,
  CheckCircle, Clock, CreditCard, ExternalLink, Share2,
  ChevronRight, Zap, Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "text-white/50 bg-white/10", icon: Clock },
  signed_up: { label: "Signed Up", color: "text-blue-400 bg-blue-400/10", icon: Users },
  subscribed: { label: "Subscribed", color: "text-emerald-400 bg-emerald-400/10", icon: CheckCircle },
  credited: { label: "Credited", color: "text-[#D4AF37] bg-[#D4AF37]/10", icon: Star },
};

export default function Referrals() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  // Safe redirect — never navigate during render (prevents React error #310)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  const { data, isLoading } = trpc.referral.getMyReferral.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading || isLoading) {
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

  const referralLink = data?.referralCode
    ? `${window.location.origin}/join?ref=${data.referralCode}`
    : "";

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShare = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Leasibility AI",
          text: "I use Leasibility AI to generate instant space feasibility reports for my clients. Try it free for 7 days.",
          url: referralLink,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleLinkedIn = () => {
    if (!referralLink) return;
    const text = encodeURIComponent(
      `I've been using Leasibility AI to generate instant feasibility reports on every commercial tour — layouts, market-calibrated budgets, and project timelines before I leave the building.\n\nIf you're a tenant rep broker, this changes how you work. Try it free for 7 days: ${referralLink}`
    );
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}&summary=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening LinkedIn share...");
  };

  const stats = data?.stats ?? { signedUp: 0, subscribed: 0, credited: 0, totalCreditMonths: 0 };
  const referrals = data?.referrals ?? [];

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Top Nav */}
      <header className="border-b border-white/8 bg-[#0A1628]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-['Inter']"
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>
            <span className="text-white/20">/</span>
            <span className="text-white font-['Montserrat'] font-700 text-sm">Referral Program</span>
          </div>
          <img src={CDN_ICON} alt="Leasibility AI" className="w-8 h-8 rounded-xl cursor-pointer" onClick={() => navigate("/")} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-4">
            <Gift size={13} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">Referral Program</span>
          </div>
          <h1 className="font-['Montserrat'] font-black text-3xl md:text-4xl text-white mb-3">
            Refer a Broker.<br />
            <span className="text-[#D4AF37]">Earn a Free Month.</span>
          </h1>
          <p className="text-white/55 font-['Inter'] text-lg max-w-xl leading-relaxed">
            For every broker who signs up through your link and starts a paid subscription, you earn one free month of Leasibility AI — automatically applied to your next billing cycle.
          </p>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { step: "01", icon: Share2, title: "Share Your Link", desc: "Copy your personal referral link and send it to any broker you know." },
            { step: "02", icon: Users, title: "They Sign Up", desc: "Your contact creates a free account and starts a 7-day trial." },
            { step: "03", icon: Gift, title: "You Get Credit", desc: "When they subscribe to any paid plan, you earn one free month." },
          ].map((item, i) => (
            <div key={i} className="bg-[#0F1F3D] border border-white/8 rounded-2xl p-5 relative">
              <div className="absolute top-4 right-4 font-['Montserrat'] font-900 text-4xl text-white/4 select-none">{item.step}</div>
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">
                <item.icon size={18} className="text-[#D4AF37]" />
              </div>
              <h3 className="font-['Montserrat'] font-700 text-white text-sm mb-1.5">{item.title}</h3>
              <p className="text-white/45 font-['Inter'] text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Referral Link Card */}
        <div className="bg-gradient-to-br from-[#1A2B4A] to-[#0F1F3D] border border-[#D4AF37]/30 rounded-3xl p-7 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
              <Zap size={18} className="text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-['Montserrat'] font-700 text-white text-base">Your Referral Link</h2>
              <p className="text-white/40 font-['Inter'] text-xs">Share this link to start earning credits</p>
            </div>
          </div>

          {/* Link display */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-[#0A1628] border border-white/10 rounded-xl px-4 py-3 font-['Inter'] text-sm text-white/70 truncate select-all">
              {referralLink || "Generating your link..."}
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-['Montserrat'] font-700 text-sm transition-all shrink-0 ${
                copied
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                  : "bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D]"
              }`}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/15 hover:border-[#D4AF37]/40 text-white/70 hover:text-white font-['Montserrat'] font-700 text-sm transition-colors shrink-0"
            >
              <Share2 size={15} />
              Share
            </button>
          </div>

          {/* LinkedIn share */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/8 mt-4">
            <button
              onClick={handleLinkedIn}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#0A66C2]/15 border border-[#0A66C2]/30 hover:bg-[#0A66C2]/25 hover:border-[#0A66C2]/50 text-[#5B9BD5] hover:text-[#7BB3E8] font-['Montserrat'] font-700 text-sm transition-all"
            >
              <Linkedin size={15} />
              Share on LinkedIn
            </button>
            <p className="text-white/25 font-['Inter'] text-xs leading-relaxed max-w-xs">
              Pre-filled post copy — your referral link is embedded automatically.
            </p>
          </div>

          {/* Code badge */}
          {data?.referralCode && (
            <div className="flex items-center gap-2">
              <span className="text-white/30 font-['Inter'] text-xs">Your code:</span>
              <span className="font-['Montserrat'] font-700 text-[#D4AF37] text-sm tracking-wider bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1 rounded-full">
                {data.referralCode}
              </span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Signed Up", value: stats.signedUp, icon: Users, color: "text-blue-400" },
            { label: "Subscribed", value: stats.subscribed, icon: CheckCircle, color: "text-emerald-400" },
            { label: "Credits Earned", value: stats.credited, icon: Star, color: "text-[#D4AF37]" },
            { label: "Free Months", value: stats.totalCreditMonths, icon: CreditCard, color: "text-purple-400" },
          ].map((s, i) => (
            <div key={i} className="bg-[#0F1F3D] border border-white/8 rounded-2xl p-5">
              <div className={`mb-2 ${s.color}`}>
                <s.icon size={18} />
              </div>
              <div className="font-['Montserrat'] font-black text-3xl text-white mb-0.5">{s.value}</div>
              <div className="text-white/40 font-['Inter'] text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Referrals Table */}
        <div className="bg-[#0F1F3D] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="font-['Montserrat'] font-700 text-white text-base">Your Referrals</h2>
            <span className="text-white/30 font-['Inter'] text-xs">{referrals.length} total</span>
          </div>

          {referrals.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-[#D4AF37]" />
              </div>
              <h3 className="font-['Montserrat'] font-700 text-white text-base mb-2">No referrals yet</h3>
              <p className="text-white/35 font-['Inter'] text-sm max-w-xs mx-auto mb-5">
                Share your link with brokers in your network. Every subscription earns you a free month.
              </p>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-700 text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                <Copy size={14} /> Copy Your Link
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {referrals.map((r: any, i: number) => {
                const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                      <Users size={14} className="text-[#D4AF37]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-['Montserrat'] font-600 text-white text-sm truncate">
                        {r.referredName || "Anonymous Broker"}
                      </div>
                      {r.referredEmail && (
                        <div className="text-white/35 font-['Inter'] text-xs truncate">{r.referredEmail}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {r.referredAt && (
                        <span className="text-white/30 font-['Inter'] text-xs hidden sm:block">
                          {new Date(r.referredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-['Inter'] ${cfg.color}`}>
                        <StatusIcon size={10} />
                        {cfg.label}
                      </span>
                      {r.creditMonths > 0 && (
                        <span className="text-[#D4AF37] font-['Montserrat'] font-700 text-xs bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-0.5 rounded-full">
                          +{r.creditMonths}mo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Terms note */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <p className="text-white/20 font-['Inter'] text-xs text-center max-w-lg">
            Credits are applied automatically to your next billing cycle once a referred broker starts a paid subscription. Credits do not expire and can stack across multiple referrals.
          </p>
          <button
            onClick={() => navigate("/referrals/terms")}
            className="inline-flex items-center gap-1.5 text-[#D4AF37]/50 hover:text-[#D4AF37] font-['Inter'] text-xs transition-colors shrink-0"
          >
            <ExternalLink size={11} />
            View full terms
          </button>
        </div>
      </main>
    </div>
  );
}
