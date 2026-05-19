import { useLocation } from "wouter";
import { ArrowLeft, Gift, CheckCircle, AlertCircle, Clock, Shield, CreditCard, Users } from "lucide-react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

type Section = {
  icon: typeof Gift;
  title: string;
  content: React.ReactNode;
};

export default function ReferralTerms() {
  const [, navigate] = useLocation();

  const sections: Section[] = [
    {
      icon: Users,
      title: "Eligibility",
      content: (
        <ul className="space-y-2 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <li className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            The referral program is open to all active Leasibility AI subscribers on any paid plan (Starter, Professional, or Team).
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            Referrals must be made to individuals who do not already have a Leasibility AI account.
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            Self-referrals — creating secondary accounts to generate credits — are not permitted and will result in account suspension.
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            Referral credits are available only to subscribers with a current, active paid subscription at the time the credit is applied.
          </li>
        </ul>
      ),
    },
    {
      icon: Gift,
      title: "How Credits Are Earned",
      content: (
        <div className="space-y-4 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            A referral credit is earned when a person you referred completes the following steps in order:
          </p>
          <ol className="space-y-2 list-none">
            {[
              "They sign up for a new Leasibility AI account using your personal referral link.",
              "They complete the 7-day free trial.",
              "They activate a paid subscription on any plan (Starter, Professional, or Team).",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-['Montserrat'] font-700 text-xs shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p>
            Credits are applied automatically to your subscription within 24 hours of the referred user's first successful payment. You will receive an in-app notification when a credit is applied.
          </p>
        </div>
      ),
    },
    {
      icon: CreditCard,
      title: "Credit Value & Limits",
      content: (
        <ul className="space-y-2 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <li className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            Each successful referral earns <strong className="text-white">one (1) free month</strong> of your current subscription plan, applied as a 100% discount on your next billing cycle.
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            There is no cap on the number of referral credits you can earn — each qualifying referral earns one free month.
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            Credits apply to your own subscription only. They cannot be transferred, gifted, or redeemed for cash.
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            If you are on an annual plan, the credit is applied as a one-month equivalent discount against your next renewal.
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            Credits are applied one at a time. If you earn multiple credits in the same billing period, each will be applied to successive billing cycles.
          </li>
        </ul>
      ),
    },
    {
      icon: Clock,
      title: "Expiry",
      content: (
        <ul className="space-y-2 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <li className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            Referral credits do not expire as long as your subscription remains active.
          </li>
          <li className="flex items-start gap-2.5">
            <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
            If your subscription is canceled or lapses before a pending credit is applied, the credit is forfeited.
          </li>
          <li className="flex items-start gap-2.5">
            <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
            Credits earned while on a trial period will only be applied once you activate a paid subscription.
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            Pending credits are visible on your Referral Program page and will carry forward to your next billing cycle automatically.
          </li>
        </ul>
      ),
    },
    {
      icon: Shield,
      title: "Abuse Prevention & Program Integrity",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            Leasibility AI reserves the right to withhold, reverse, or cancel referral credits if fraudulent or abusive activity is detected, including but not limited to:
          </p>
          <ul className="space-y-2">
            {[
              "Creating multiple accounts to self-refer.",
              "Using automated tools, bots, or scripts to generate referrals.",
              "Referring individuals who do not intend to use the platform in good faith.",
              "Misrepresenting the product in referral communications.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p>
            Accounts found to be in violation of these terms may be suspended without notice. CREEL Solutions LLC reserves the right to modify or discontinue the referral program at any time with reasonable notice to active participants.
          </p>
        </div>
      ),
    },
    {
      icon: AlertCircle,
      title: "Program Changes & Termination",
      content: (
        <p className="text-white/60 font-['Inter'] text-sm leading-relaxed">
          CREEL Solutions LLC reserves the right to modify the referral program terms, credit values, or eligibility requirements at any time. Changes will be communicated via in-app notification at least 14 days before taking effect. Earned credits that have already been applied to your subscription will not be reversed due to program changes.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Nav */}
      <header className="border-b border-white/8 bg-[#0A1628]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/referrals")}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-['Inter']"
            >
              <ArrowLeft size={16} />
              Referral Program
            </button>
            <span className="text-white/20">/</span>
            <span className="text-white font-['Montserrat'] font-700 text-sm">Terms & Conditions</span>
          </div>
          <img
            src={CDN_ICON}
            alt="Leasibility AI"
            className="w-8 h-8 rounded-xl cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-4">
            <Shield size={13} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">Program Terms</span>
          </div>
          <h1 className="font-['Montserrat'] font-black text-3xl md:text-4xl text-white mb-3">
            Referral Program<br />
            <span className="text-[#D4AF37]">Terms & Conditions</span>
          </h1>
          <p className="text-white/50 font-['Inter'] text-base leading-relaxed max-w-xl">
            These terms govern participation in the Leasibility AI Referral Program, operated by CREEL Solutions LLC. By sharing your referral link, you agree to these terms.
          </p>
          <p className="text-white/30 font-['Inter'] text-xs mt-3">
            Last updated: March 2026
          </p>
        </div>

        {/* Quick Summary Card */}
        <div className="bg-gradient-to-br from-[#1A2B4A] to-[#0F1F3D] border border-[#D4AF37]/25 rounded-2xl p-6 mb-10">
          <h2 className="font-['Montserrat'] font-700 text-white text-base mb-4">Quick Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Credit per referral", value: "1 free month" },
              { label: "Credit cap", value: "Unlimited" },
              { label: "Expiry", value: "None (while active)" },
            ].map((item, i) => (
              <div key={i} className="text-center bg-[#0A1628]/50 rounded-xl p-4">
                <div className="font-['Montserrat'] font-800 text-[#D4AF37] text-xl mb-1">{item.value}</div>
                <div className="text-white/40 font-['Inter'] text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="bg-[#0F1F3D] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <section.icon size={16} className="text-[#D4AF37]" />
                </div>
                <h2 className="font-['Montserrat'] font-700 text-white text-base">{section.title}</h2>
              </div>
              {section.content}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-white/25 font-['Inter'] text-xs">
            Questions? Contact us at{" "}
            <a href="mailto:hello@leasibility.ai" className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
              hello@leasibility.ai
            </a>
          </p>
          <button
            onClick={() => navigate("/referrals")}
            className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-700 text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            <Gift size={14} />
            Back to Referral Program
          </button>
        </div>
      </main>
    </div>
  );
}
