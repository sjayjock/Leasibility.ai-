import { useLocation } from "wouter";
import { Shield, ArrowLeft, Lock, Database, CreditCard, Share2, Mail, Globe, Trash2, AlertCircle } from "lucide-react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

type PolicySection = {
  id: string;
  icon: typeof Shield;
  title: string;
  content: React.ReactNode;
};

export default function Privacy() {
  const [, navigate] = useLocation();

  const sections: PolicySection[] = [
    {
      id: "overview",
      icon: Shield,
      title: "Overview",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            Leasibility AI is operated by CREEL Solutions LLC ("we," "us," or "our"). This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our platform at <span className="text-white/80">leasibility.ai</span> and related services.
          </p>
          <p>
            By creating an account or using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use our platform.
          </p>
        </div>
      ),
    },
    {
      id: "data-collected",
      icon: Database,
      title: "Information We Collect",
      content: (
        <div className="space-y-4 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <div>
            <p className="text-white/80 font-['Montserrat'] font-600 text-sm mb-2">Account Information</p>
            <p>When you sign in via Manus OAuth, we receive and store your name, email address, and a unique identifier. We use this to create and manage your account.</p>
          </div>
          <div>
            <p className="text-white/80 font-['Montserrat'] font-600 text-sm mb-2">Broker Profile Data</p>
            <p>You may optionally provide your brokerage name, title, phone number, company logo, and professional photo. This data is used solely to brand your exported client reports.</p>
          </div>
          <div>
            <p className="text-white/80 font-['Montserrat'] font-600 text-sm mb-2">Project & Floor Plan Data</p>
            <p>When you create a project, we store the property address, square footage, tenant headcount, industry, and any floor plan files you upload. Floor plan images are stored securely in encrypted cloud storage (Amazon S3) and are used only to generate AI analysis for your account.</p>
          </div>
          <div>
            <p className="text-white/80 font-['Montserrat'] font-600 text-sm mb-2">Usage Data</p>
            <p>We collect standard server logs including IP addresses, browser type, pages visited, and timestamps. This data is used for security monitoring, debugging, and aggregate analytics. We do not sell or share this data with third parties for advertising purposes.</p>
          </div>
          <div>
            <p className="text-white/80 font-['Montserrat'] font-600 text-sm mb-2">Report View Tracking</p>
            <p>When a client opens a shared report link, we log the timestamp, a hashed IP address (not the raw IP), user agent, and approximate country. This data is displayed to you as "read receipt" information and is not shared with third parties.</p>
          </div>
        </div>
      ),
    },
    {
      id: "payments",
      icon: CreditCard,
      title: "Payment Information (Stripe)",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            All payment processing is handled by <strong className="text-white/80">Stripe, Inc.</strong>, a PCI-DSS Level 1 certified payment processor. We do not store your credit card number, CVV, or full card details on our servers at any time.
          </p>
          <p>
            We store only your Stripe Customer ID and Subscription ID, which are reference identifiers used to manage your subscription status. Stripe's privacy policy governs the handling of your payment data and is available at <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">stripe.com/privacy</a>.
          </p>
          <p>
            Stripe may use cookies and tracking technologies on checkout pages in accordance with their own privacy practices.
          </p>
        </div>
      ),
    },
    {
      id: "referrals",
      icon: Share2,
      title: "Referral Program Data",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            If you participate in our referral program, we store your unique referral code, the identities of users who signed up through your link, and the status of each referral (pending, signed up, subscribed, credited).
          </p>
          <p>
            When a referred user signs up, their name and email may be visible to you on your Referral Program page to help you track your referrals. Referred users are informed that their signup may be attributed to a referral.
          </p>
          <p>
            We do not share referral data with third parties beyond what is necessary to apply Stripe billing credits.
          </p>
        </div>
      ),
    },
    {
      id: "ai-data",
      icon: Globe,
      title: "AI Processing & Third-Party Services",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            Floor plan images and project details you submit are processed by AI language and vision models to generate space analysis, budget estimates, and scenario plans. This processing occurs via secure API calls to third-party AI providers. Your data is transmitted over encrypted connections (TLS/HTTPS) and is not used to train AI models without your explicit consent.
          </p>
          <p>
            Generated reports, layouts, and AI summaries are stored in our database and associated with your account. You may delete any project at any time, which permanently removes the associated data from our systems within 30 days.
          </p>
        </div>
      ),
    },
    {
      id: "data-sharing",
      icon: Lock,
      title: "How We Share Your Data",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>We do not sell your personal information. We share data only in the following limited circumstances:</p>
          <ul className="space-y-2 mt-2">
            {[
              { label: "Service Providers", desc: "We use Amazon Web Services (S3) for file storage, Stripe for payments, and Manus for authentication and AI services. Each provider is bound by data processing agreements." },
              { label: "Legal Requirements", desc: "We may disclose information if required by law, subpoena, or other legal process, or to protect the rights, property, or safety of CREEL Solutions LLC, our users, or the public." },
              { label: "Business Transfers", desc: "In the event of a merger, acquisition, or sale of assets, user data may be transferred as part of the transaction. We will notify affected users via email or in-app notice." },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 mt-2 shrink-0" />
                <span><strong className="text-white/80">{item.label}:</strong> {item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: "retention",
      icon: Trash2,
      title: "Data Retention & Deletion",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>
            We retain your account data for as long as your account is active. Floor plan files and project data are retained until you delete the project or close your account.
          </p>
          <p>
            Upon account cancellation, your data is retained for 30 days to allow for reactivation, then permanently deleted from our primary systems within 60 days. Backup copies may persist for up to 90 days before being overwritten.
          </p>
          <p>
            To request immediate deletion of your account and all associated data, contact us at <a href="mailto:hello@leasibility.ai" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">hello@leasibility.ai</a>. We will process deletion requests within 30 days.
          </p>
        </div>
      ),
    },
    {
      id: "rights",
      icon: AlertCircle,
      title: "Your Rights",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
          <ul className="space-y-2 mt-2">
            {[
              "Access: Request a copy of the personal data we hold about you.",
              "Correction: Request correction of inaccurate or incomplete data.",
              "Deletion: Request deletion of your personal data (subject to legal retention requirements).",
              "Portability: Request your data in a structured, machine-readable format.",
              "Objection: Object to certain types of processing, including direct marketing.",
            ].map((right, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 mt-2 shrink-0" />
                {right}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at <a href="mailto:hello@leasibility.ai" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">hello@leasibility.ai</a>. We will respond within 30 days.
          </p>
        </div>
      ),
    },
    {
      id: "contact",
      icon: Mail,
      title: "Contact Us",
      content: (
        <div className="space-y-3 text-white/60 font-['Inter'] text-sm leading-relaxed">
          <p>If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:</p>
          <div className="bg-[#0A1628] border border-white/8 rounded-xl p-4 mt-3 space-y-1.5">
            <p><strong className="text-white/80">CREEL Solutions LLC</strong></p>
            <p>Email: <a href="mailto:hello@leasibility.ai" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">hello@leasibility.ai</a></p>
            <p>Product: Leasibility AI — <span className="text-white/40">leasibility.ai</span></p>
          </div>
          <p className="text-white/30 text-xs mt-2">
            We are committed to resolving privacy concerns promptly and transparently.
          </p>
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
            <span className="text-white font-['Montserrat'] font-700 text-sm">Privacy Policy</span>
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
            <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="font-['Montserrat'] font-black text-3xl md:text-4xl text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-white/50 font-['Inter'] text-base leading-relaxed max-w-xl">
            This policy describes how CREEL Solutions LLC collects, uses, and protects your personal information when you use Leasibility AI.
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
          <p className="text-white/25 font-['Inter'] text-xs">
            © 2026 CREEL Solutions LLC. All rights reserved.
          </p>
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
