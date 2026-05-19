import { useLocation } from "wouter";
import { FileText, ArrowLeft, CreditCard, Shield, AlertTriangle, Globe, Scale, Trash2, Mail, CheckCircle } from "lucide-react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

export default function Terms() {
  const [, navigate] = useLocation();

  const sections = [
    {
      id: "acceptance",
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            These Terms of Service ("Terms") govern your access to and use of Leasibility AI, operated by CREEL Solutions LLC ("Company," "we," "us," or "our"). By creating an account, clicking "I agree," or otherwise accessing or using our services, you agree to be bound by these Terms.
          </p>
          <p>
            If you are using the service on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms. If you do not agree to these Terms, you may not use the service.
          </p>
          <p>
            We reserve the right to update these Terms at any time. We will notify you of material changes via email or in-app notice. Continued use of the service after changes take effect constitutes acceptance of the revised Terms.
          </p>
        </div>
      ),
    },
    {
      id: "service",
      icon: Globe,
      title: "Description of Service",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            Leasibility AI is a software-as-a-service (SaaS) platform designed for commercial real estate professionals. The platform enables users to upload floor plans, input tenant program requirements, and receive AI-generated space analysis including scenario layouts, budget estimates, and project timeline projections.
          </p>
          <p>
            The service is intended for use by licensed commercial real estate brokers, tenant representatives, and related professionals. Use of the service for residential real estate, personal use, or any purpose outside commercial real estate feasibility analysis is not permitted without prior written consent from CREEL Solutions LLC.
          </p>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice where practicable.
          </p>
        </div>
      ),
    },
    {
      id: "accounts",
      icon: Shield,
      title: "Accounts & Eligibility",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            You must be at least 18 years of age and capable of forming a binding contract to create an account. Accounts are for individual use only and may not be shared. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.
          </p>
          <p>
            You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. We reserve the right to suspend or terminate accounts that contain false or misleading information.
          </p>
          <p>
            One account per individual is permitted. Creating multiple accounts to circumvent subscription limits, referral program rules, or trial restrictions is prohibited and may result in permanent suspension.
          </p>
        </div>
      ),
    },
    {
      id: "subscriptions",
      icon: CreditCard,
      title: "Subscriptions & Billing",
      content: (
        <div className="space-y-4 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <div>
            <p className="text-white/80 font-['Montserrat'] font-600 text-sm mb-2">Free Trial</p>
            <p>New accounts receive a 7-day free trial on all paid plans. No credit card is required to start a trial. At the end of the trial period, your account will automatically convert to a paid subscription unless you cancel before the trial expires.</p>
          </div>
          <div>
            <p className="text-white/80 font-['Montserrat'] font-600 text-sm mb-2">Paid Plans</p>
            <p>Paid subscriptions are billed monthly or annually in advance. All fees are non-refundable except as required by applicable law or as expressly stated in these Terms. Prices are subject to change with 30 days' notice.</p>
          </div>
          <div>
            <p className="text-white/80 font-['Montserrat'] font-600 text-sm mb-2">Cancellation</p>
            <p>You may cancel your subscription at any time through the Billing page or by contacting us at <a href="mailto:hello@leasibility.ai" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">hello@leasibility.ai</a>. Cancellation takes effect at the end of the current billing period. You will retain access to the service until that date.</p>
          </div>
          <div>
            <p className="text-white/80 font-['Montserrat'] font-600 text-sm mb-2">Referral Credits</p>
            <p>Referral credits are applied as billing discounts on future subscription cycles. Credits have no cash value, are non-transferable, and may not be redeemed for cash. Credits are subject to the <button onClick={() => window.location.href = "/referrals/terms"} className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">Referral Program Terms</button>.</p>
          </div>
        </div>
      ),
    },
    {
      id: "acceptable-use",
      icon: CheckCircle,
      title: "Acceptable Use",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>You agree not to use the service to:</p>
          <ul className="space-y-2 mt-2">
            {[
              "Upload floor plans or other materials that you do not have the right to use or share",
              "Generate reports for properties you are not engaged to represent",
              "Reverse engineer, decompile, or attempt to extract the source code of the platform",
              "Scrape, crawl, or use automated means to access the service without our express written consent",
              "Circumvent any rate limits, usage caps, or access controls",
              "Use the service to generate content that is false, misleading, or fraudulent",
              "Resell, sublicense, or white-label the service without an Enterprise agreement",
              "Violate any applicable law, regulation, or third-party right",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Violation of these restrictions may result in immediate account suspension without refund.
          </p>
        </div>
      ),
    },
    {
      id: "ai-outputs",
      icon: AlertTriangle,
      title: "AI-Generated Content & Disclaimers",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            Leasibility AI uses artificial intelligence to generate space layouts, budget estimates, and project timelines. These outputs are <strong className="text-white/80">approximations for feasibility planning purposes only</strong> and do not constitute professional architectural, engineering, construction, or financial advice.
          </p>
          <p>
            AI-generated budget estimates are based on national and regional benchmarks and may not reflect current local market conditions, specific contractor pricing, or project-specific variables. You should not present AI-generated estimates to clients as guaranteed costs or professional bids.
          </p>
          <p>
            AI-generated floor plan layouts are conceptual only and do not meet building code, ADA, fire egress, or any other regulatory requirements. All layouts must be reviewed and certified by a licensed architect or engineer before use in construction or permitting.
          </p>
          <p className="text-white/40 text-xs bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-lg p-3">
            By using AI-generated outputs, you acknowledge that CREEL Solutions LLC is not liable for any decisions made based on these estimates, and that you are solely responsible for verifying the accuracy of any information shared with clients.
          </p>
        </div>
      ),
    },
    {
      id: "ip",
      icon: FileText,
      title: "Intellectual Property",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            The Leasibility AI platform, including its software, design, trademarks, and underlying AI models, is owned by CREEL Solutions LLC and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works based on the platform without our express written consent.
          </p>
          <p>
            You retain ownership of all floor plan files, project data, and other content you upload to the platform ("Your Content"). By uploading content, you grant CREEL Solutions LLC a limited, non-exclusive, royalty-free license to process and store Your Content solely for the purpose of providing the service to you.
          </p>
          <p>
            AI-generated outputs (layouts, reports, estimates) produced from Your Content are owned by you and may be used for your commercial real estate business purposes. We do not claim ownership of AI outputs generated from your data.
          </p>
          <p>
            We may use aggregated, anonymised, non-identifiable usage data to improve the platform and AI models. We will never use your specific floor plan data or client information to train AI models without your explicit consent.
          </p>
        </div>
      ),
    },
    {
      id: "liability",
      icon: Scale,
      title: "Limitation of Liability",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            To the maximum extent permitted by applicable law, CREEL Solutions LLC and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or business opportunities, arising from your use of or inability to use the service.
          </p>
          <p>
            Our total aggregate liability to you for any claims arising from these Terms or your use of the service shall not exceed the total amount paid by you to CREEL Solutions LLC in the 12 months preceding the claim.
          </p>
          <p>
            Some jurisdictions do not allow the exclusion or limitation of certain damages, so the above limitations may not apply to you in full.
          </p>
        </div>
      ),
    },
    {
      id: "termination",
      icon: Trash2,
      title: "Termination",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            You may terminate your account at any time by cancelling your subscription and contacting us at <a href="mailto:hello@leasibility.ai" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">hello@leasibility.ai</a>. Upon termination, your access to the service will end at the conclusion of your current billing period.
          </p>
          <p>
            We may suspend or terminate your account immediately, without prior notice or liability, if you breach these Terms or engage in conduct that we reasonably determine to be harmful to other users, the platform, or CREEL Solutions LLC.
          </p>
          <p>
            Upon termination, your data will be retained for 30 days and then permanently deleted in accordance with our Privacy Policy. You may request an export of your data before termination by contacting us.
          </p>
        </div>
      ),
    },
    {
      id: "governing-law",
      icon: Scale,
      title: "Governing Law & Disputes",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Texas, United States, without regard to its conflict of law provisions.
          </p>
          <p>
            Any dispute arising from or relating to these Terms or the service shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with the American Arbitration Association's Commercial Arbitration Rules, conducted in Texas.
          </p>
          <p>
            You waive any right to participate in a class action lawsuit or class-wide arbitration against CREEL Solutions LLC.
          </p>
        </div>
      ),
    },
    {
      id: "contact",
      icon: Mail,
      title: "Contact",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>For questions about these Terms, please contact us:</p>
          <div className="bg-[#0A1628] border border-white/8 rounded-xl p-4 mt-3 space-y-1.5">
            <p><strong className="text-white/80">CREEL Solutions LLC</strong></p>
            <p>Email: <a href="mailto:hello@leasibility.ai" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">hello@leasibility.ai</a></p>
            <p>Product: Leasibility AI — <span className="text-white/40">leasibility.ai</span></p>
          </div>
        </div>
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
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-['Inter']"
            >
              <ArrowLeft size={16} />
              Home
            </button>
            <span className="text-white/20">/</span>
            <span className="text-white font-['Montserrat'] font-700 text-sm">Terms of Service</span>
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
            <FileText size={13} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="font-['Montserrat'] font-black text-3xl md:text-4xl text-white mb-3">
            Terms of Service
          </h1>
          <p className="text-white/50 font-['Inter'] text-base leading-relaxed max-w-xl">
            Please read these terms carefully before using Leasibility AI. By using the platform, you agree to be bound by these terms.
          </p>
          <p className="text-white/30 font-['Inter'] text-xs mt-3">
            Effective date: March 2026 &nbsp;·&nbsp; Last updated: March 2026
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-[#0F1F3D] border border-white/8 rounded-2xl p-5 mb-10">
          <p className="text-white/50 font-['Montserrat'] font-700 text-xs uppercase tracking-wider mb-3">Contents</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 text-white/40 hover:text-[#D4AF37] font-['Inter'] text-sm transition-colors py-0.5"
              >
                <span className="text-white/20 font-['Montserrat'] text-xs">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="bg-[#0F1F3D] border border-white/8 rounded-2xl p-6 scroll-mt-20">
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
          <div className="space-y-1">
            <p className="text-white/25 font-['Inter'] text-xs">
              © 2026 CREEL Solutions LLC. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/privacy")}
                className="text-white/30 hover:text-[#D4AF37] font-['Inter'] text-xs transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-white/15">·</span>
              <button
                onClick={() => navigate("/referrals/terms")}
                className="text-white/30 hover:text-[#D4AF37] font-['Inter'] text-xs transition-colors"
              >
                Referral Terms
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 border border-white/15 hover:border-[#D4AF37]/40 text-white/50 hover:text-white font-['Montserrat'] font-700 text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
}
