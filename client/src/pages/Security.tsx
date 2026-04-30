import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Server, Eye, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

const sections = [
  {
    icon: Lock,
    title: "Data Encryption",
    content: [
      "All data transmitted between your browser and our servers is encrypted using TLS 1.3 (HTTPS). We do not serve any content over unencrypted HTTP.",
      "Data at rest in our database is encrypted using AES-256 encryption managed by our cloud infrastructure provider.",
      "Uploaded floor plans and broker assets (photos, logos) are stored in Amazon S3 with server-side encryption (SSE-S3) enabled by default.",
      "Session tokens are signed with a rotating secret using industry-standard JWT (HS256) and stored as HttpOnly, Secure, SameSite=Strict cookies — inaccessible to JavaScript.",
    ],
  },
  {
    icon: Server,
    title: "Infrastructure & Hosting",
    content: [
      "Leasibility AI is hosted on enterprise-grade cloud infrastructure with automatic failover and 99.9% uptime SLA.",
      "Our database is a managed TiDB/MySQL cluster with automated daily backups retained for 30 days.",
      "File storage uses Amazon S3 with versioning enabled. Deleted files are retained for 30 days before permanent removal.",
      "All infrastructure access is restricted to authorised personnel via multi-factor authentication and role-based access controls.",
    ],
  },
  {
    icon: Eye,
    title: "Access Controls",
    content: [
      "Each user account is isolated — you can only access your own projects, reports, and broker profile. No cross-account data access is possible.",
      "Authentication is handled via Manus OAuth, which supports Google Sign-In. We do not store passwords.",
      "Shared report links are protected by unique, cryptographically random tokens. Only users with the exact link can view a shared report.",
      "Admin access to production systems is restricted to the founding team and requires MFA.",
    ],
  },
  {
    icon: Eye,
    title: "Floor Plan & Client Data",
    content: [
      "Floor plans you upload are used solely to generate AI feasibility scenarios for your project. They are not shared with other users, used to train AI models, or disclosed to third parties.",
      "Client names and headcount data you enter are stored only in your account and are not visible to other users.",
      "We do not sell, rent, or share your data or your clients' data with any third party for marketing or commercial purposes.",
      "AI analysis is performed using a third-party LLM API. Floor plan images may be transmitted to this API for processing. The API provider is contractually prohibited from using your data for model training.",
    ],
  },
  {
    icon: RefreshCw,
    title: "Data Retention",
    content: [
      "Your projects, scenarios, and reports are retained for as long as your account is active.",
      "If you cancel your subscription, your data is retained for 90 days to allow for reactivation or export.",
      "After 90 days of account inactivity following cancellation, all project data, floor plans, and reports are permanently deleted.",
      "You can request immediate deletion of your account and all associated data at any time by contacting hello@leasibility.ai.",
    ],
  },
  {
    icon: AlertCircle,
    title: "Incident Response",
    content: [
      "In the event of a confirmed data breach affecting your personal information, we will notify affected users within 72 hours via email.",
      "We maintain an incident response plan reviewed annually by the founding team.",
      "Security vulnerabilities can be responsibly disclosed to security@leasibility.ai. We commit to acknowledging reports within 48 hours.",
    ],
  },
];

const certifications = [
  { label: "TLS 1.3 Encryption", status: "Active" },
  { label: "AES-256 Data at Rest", status: "Active" },
  { label: "Stripe PCI DSS Compliance", status: "Active" },
  { label: "HttpOnly Session Cookies", status: "Active" },
  { label: "Automated Daily Backups", status: "Active" },
  { label: "S3 Server-Side Encryption", status: "Active" },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-[#0A1628]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src={CDN_ICON} alt="Leasibility AI" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-white text-lg">Leasibility <span className="text-[#D4AF37]">AI</span></span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white gap-2">
              <ArrowLeft size={14} />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container max-w-4xl py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-6">
            <Shield size={13} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-widest">Data Security</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Your Data is Protected
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Floor plans, client data, and broker information are sensitive. Here is exactly how Leasibility AI protects everything you upload and store.
          </p>
        </div>

        {/* Security status grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-14">
          {certifications.map((cert) => (
            <div key={cert.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <div>
                <div className="text-white text-xs font-medium">{cert.label}</div>
                <div className="text-emerald-400 text-xs">{cert.status}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                  <section.icon size={18} className="text-[#D4AF37]" />
                </div>
                <h2 className="text-white font-bold text-lg">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.content.map((para, j) => (
                  <p key={j} className="text-white/65 text-sm leading-relaxed pl-13">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-lg mb-2">Security Questions?</h3>
          <p className="text-white/60 text-sm mb-5">
            For security disclosures, compliance documentation requests, or questions about how your data is handled, contact our team directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:security@leasibility.ai">
              <Button className="bg-[#D4AF37] hover:bg-[#C4A030] text-[#0A1628] font-semibold">
                security@leasibility.ai
              </Button>
            </a>
            <Link href="/contact">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                Contact Form
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-white/30 text-xs text-center mt-10">
          Last updated: March 2026. See also our{" "}
          <Link href="/privacy"><span className="text-white/50 hover:text-white underline cursor-pointer">Privacy Policy</span></Link>{" "}
          and{" "}
          <Link href="/terms"><span className="text-white/50 hover:text-white underline cursor-pointer">Terms of Service</span></Link>.
        </p>
      </div>
    </div>
  );
}
