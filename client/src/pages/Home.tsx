import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload, Zap, FileText, BarChart3, Users, Building2,
  CheckCircle, ArrowRight, Menu, X, Star, TrendingUp,
  Clock, Shield, ChevronDown, MapPin, DollarSign, Layout
} from "lucide-react";

/* ============================================================
   LEASIBILITY AI — LANDING PAGE
   Design: Midnight Command — Deep Navy + Precision Gold
   Sections: Nav, Hero, Stats, How It Works, Features,
             App Preview, Pricing, Testimonials, CTA, Footer
   ============================================================ */

const CDN = {
  icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png",
  dashboard: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_screen_dashboard_a16ba10d.png",
  testfit: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_screen_testfit_5984f698.png",
  report: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_screen_report_eb988728.png",
  heroBg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/hero_bg-eyiZAoAWyqioCxwB96YPfv.webp",
  workflow: "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/feature_workflow-EmAcrCkSDeZ38ZdYCWfgAH.webp",
};

// ─── Animation Variants ───────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

// ─── Animated Section Wrapper ─────────────────────────────────
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Counter Animation ────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Navigation ───────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0A1628]/95 backdrop-blur-md border-b border-white/10 shadow-2xl" : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={CDN.icon} alt="Leasibility AI" className="w-9 h-9 rounded-xl" />
            <span className="font-['Montserrat'] font-800 text-xl tracking-tight text-white">
              Leasibility <span className="text-gold-gradient">AI</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 font-['Inter']"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/demo"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2 font-['Inter']"
            >
              Try Demo
            </a>
            <a
              href="/start"
              className="btn-gold text-xs px-5 py-2.5 rounded-lg"
            >
              Start Free Trial
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0A1628]/98 border-t border-white/10"
          >
            <div className="container py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white font-['Inter'] text-sm py-2"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/demo"
                onClick={() => setOpen(false)}
                className="btn-gold text-xs px-5 py-3 rounded-lg mt-2"
              >
                Run a Sample Deal
              </a>
              <a
                href="/start"
                onClick={() => setOpen(false)}
                className="border border-white/20 text-white text-xs px-5 py-3 rounded-lg text-center font-['Montserrat'] font-600"
              >
                Start Free Trial
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={CDN.heroBg}
          alt="Commercial real estate office space — hero background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/80 to-[#0A1628]/40" />
        <div className="absolute inset-0 grid-overlay opacity-30" />
      </div>

      <div className="relative container pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/5 border border-[#D4AF37]/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-600 uppercase tracking-widest">
                Space Intelligence for Tenant Rep Brokers
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-['Montserrat'] font-black text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05] tracking-tight mb-3"
            >
              <span className="text-white">Close More Tenant Rep</span>
              <span className="text-gold-gradient block">Deals in Less Time.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={fadeUp}
              className="text-[#D4AF37]/80 text-base md:text-lg font-['Montserrat'] font-600 tracking-wide mb-5"
            >
              Generate site analyses, client-ready reports, and deal insights in seconds — not hours, days, or weeks.
            </motion.p>

            {/* Body copy */}
            <motion.p
              variants={fadeUp}
              className="text-white/70 text-base md:text-lg font-['Inter'] font-light leading-relaxed mb-8"
            >
              See a complete test fit, budget, and timeline generated in seconds — then run it on your own deal. Built specifically for tenant rep brokers who are tired of waiting weeks on architects and contractors.
            </motion.p>

            {/* CTAs — Primary: Run a Sample Deal, Secondary: Start Free Trial */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href="/demo"
                className="btn-gold text-sm px-8 py-4 rounded-lg flex items-center justify-center gap-2"
              >
                Run a Sample Deal
                <ArrowRight size={16} />
              </a>
              <a
                href="/start"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-white/20 text-white text-sm font-['Montserrat'] font-600 hover:border-white/40 hover:text-[#D4AF37] transition-colors"
              >
                Start Free Trial
              </a>
            </motion.div>

            {/* Trust Signals */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6 text-white/50 text-xs font-['Inter']">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-[#D4AF37]" />
                No credit card for demo
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-[#D4AF37]" />
                Results in under 60 seconds
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-[#D4AF37]" />
                Built for tenant rep brokers
              </div>
            </motion.div>
          </motion.div>

          {/* Right: App Screens */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" as const }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-3xl blur-3xl" />

            {/* Main screen — test-fit */}
            <div className="relative z-10">
              <img
                src={CDN.testfit}
                alt="Leasibility AI Test-Fit Screen"
                className="w-72 rounded-3xl shadow-2xl shadow-black/50 border border-white/10"
              />
            </div>

            {/* Secondary screen — dashboard */}
            <div className="absolute -left-12 top-8 z-20">
              <img
                src={CDN.dashboard}
                alt="Leasibility AI Dashboard"
                className="w-52 rounded-2xl shadow-2xl shadow-black/60 border border-white/10 opacity-90"
              />
            </div>

            {/* Floating stat card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
              className="absolute -bottom-4 right-0 z-30 bg-[#0F1F3D] border border-[#D4AF37]/30 rounded-xl px-4 py-3 shadow-xl"
            >
              <div className="text-[#D4AF37] font-['Montserrat'] font-800 text-xl">87%</div>
              <div className="text-white/60 text-xs font-['Inter']">Space Efficiency Score</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: 60, suffix: "s", prefix: "<", label: "Time to First Report" },
    { value: 3, suffix: " Scenarios", prefix: "", label: "AI Plans Generated" },
    { value: 50000, suffix: " sq ft", prefix: "", label: "Max Space Analyzed" },
    { value: 87, suffix: "%", prefix: "", label: "Avg. Efficiency Score" },
  ];

  return (
    <section className="bg-[#0D1B35] border-y border-white/8 py-10">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="text-center"
            >
              <AnimatedSection>
                <motion.div variants={fadeUp}>
                  <div className="font-['Montserrat'] font-black text-3xl md:text-4xl text-gold-gradient mb-1">
                    <AnimatedCounter target={s.value} suffix={s.suffix} prefix={s.prefix} />
                  </div>
                  <div className="text-white/50 text-sm font-['Inter']">{s.label}</div>
                </motion.div>
              </AnimatedSection>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      step: "01",
      title: "Upload or Scan the Space",
      desc: "Upload a PDF floor plan from your desktop, or use your phone to scan the space live during the tour. Accepted formats: PDF, JPG, PNG — or real-time mobile scan.",
    },
    {
      icon: Zap,
      step: "02",
      title: "AI Analyzes the Program",
      desc: "Enter the tenant's headcount and industry. Leasibility AI interprets the space, maps the program, and benchmarks it against national data — or suggests a standard program automatically.",
    },
    {
      icon: Layout,
      step: "03",
      title: "3 Scenarios Generated",
      desc: "The AI produces three build-out scenarios — Light Refresh, Moderate Build-Out, and Full Transformation — each with a space layout, efficiency score, market-calibrated budget, and phase-by-phase project timeline from decision to occupancy.",
    },
    {
      icon: FileText,
      step: "04",
      title: "Export a Branded Report",
      desc: "Send a PDF or shareable link to your client with your name, photo, and contact details. Know the moment they open it.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[#0A1628]">
      <div className="container">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">The Workflow</span>
            </div>
            <h2 className="font-['Montserrat'] font-black text-3xl md:text-5xl text-white mb-4">
              From Tour to Report.<br />
              <span className="text-gold-gradient">Before You Leave the Building.</span>
            </h2>
            <p className="text-white/60 text-lg font-['Inter'] max-w-2xl mx-auto">
              Leasibility AI is built for the pace of a broker's day. No design skills. No setup. Just the certainty your client needs to make a decision — delivered in under 60 seconds.
            </p>
          </motion.div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {steps.map((step, i) => (
            <AnimatedSection key={i} className="h-full">
              <motion.div
                variants={fadeUp}
                className="card-glow rounded-2xl p-6 relative group h-full flex flex-col"
              >
                {/* Step number */}
                <div className="absolute top-4 right-4 font-['Montserrat'] font-900 text-4xl text-white/5 select-none">
                  {step.step}
                </div>
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-5 group-hover:bg-[#D4AF37]/20 transition-colors">
                  <step.icon size={22} className="text-[#D4AF37]" />
                </div>
                <h3 className="font-['Montserrat'] font-700 text-white text-lg mb-3">{step.title}</h3>
                <p className="text-white/55 text-sm font-['Inter'] leading-relaxed flex-1">{step.desc}</p>
                {/* Connector arrow */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#D4AF37]/40">
                    <ArrowRight size={18} />
                  </div>
                )}
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Workflow Image */}
        <AnimatedSection>
          <motion.div variants={fadeUp} className="mt-16 rounded-2xl overflow-hidden border border-white/10">
            <img src={CDN.workflow} alt="Leasibility AI Workflow" className="w-full object-cover" />
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Layout,
      title: "3-Scenario AI Analysis",
      desc: "Light Refresh, Moderate Build-Out, and Full Transformation — three distinct scenarios generated instantly, each calibrated to the actual scope of work required to make the space work.",
    },
    {
      icon: DollarSign,
      title: "Budget Estimator",
      desc: "City-specific build-out cost benchmarks with low/mid/high ranges. Includes TI allowance calculator and total occupancy cost breakdown.",
    },
    {
      icon: BarChart3,
      title: "Space Efficiency Score",
      desc: "Every layout receives an efficiency rating showing usable square footage vs. total. Instantly communicate the value of one space over another.",
    },
    {
      icon: FileText,
      title: "Branded Client Reports",
      desc: "Export a premium PDF or shareable web link with your name, photo, and contact info. White-label ready for Team and Enterprise plans.",
    },
    {
      icon: MapPin,
      title: "Market Benchmarks",
      desc: "Build-out cost data calibrated to your market — New York, Chicago, Los Angeles, and 20+ major US cities — with broker override capability.",
    },
    {
      icon: Clock,
      title: "Project Timeline Estimates",
      desc: "Every scenario includes an estimated timeline from lease execution through construction completion and occupancy — so your client can plan with confidence.",
    },
    {
      icon: TrendingUp,
      title: "Read Receipts",
      desc: "Know the moment your client opens the shared report. Timing your follow-up call has never been more precise.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      desc: "Team plans include full project visibility across your brokerage, co-broker sharing, and white-labeled reports for your entire firm.",
    },
    {
      icon: Shield,
      title: "Secure & Confidential",
      desc: "Floor plan data is encrypted in transit and at rest. Projects are automatically deleted 30 days after account cancellation.",
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-[#0D1B35]">
      <div className="container">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">Platform Features</span>
            </div>
            <h2 className="font-['Montserrat'] font-black text-3xl md:text-5xl text-white mb-4">
              Every Tool a Tenant Rep<br />
              <span className="text-gold-gradient">Broker Needs.</span>
            </h2>
            <p className="text-white/60 text-lg font-['Inter'] max-w-2xl mx-auto">
              Built specifically for the commercial real estate leasing process — not adapted from residential tools or generic space planning software.
            </p>
          </motion.div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {features.map((f, i) => (
            <AnimatedSection key={i} className="h-full">
              <motion.div
                variants={fadeUp}
                className="card-glow rounded-2xl p-6 group h-full flex flex-col"
              >
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                  <f.icon size={18} className="text-[#D4AF37]" />
                </div>
                <h3 className="font-['Montserrat'] font-700 text-white text-base mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm font-['Inter'] leading-relaxed flex-1">{f.desc}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── App Preview ──────────────────────────────────────────────
function AppPreview() {
  const [active, setActive] = useState(0);
  const screens = [
    { label: "Dashboard", img: CDN.dashboard, desc: "Manage all active projects from a single view. Each property card shows the floor plan thumbnail, square footage, and quick access to the full report." },
    { label: "Test-Fit Results", img: CDN.testfit, desc: "Two AI-generated scenario plans displayed side-by-side — each with space layout, efficiency score, budgetary range from national cost benchmarks, and an estimated timeline from decision to move-in." },
    { label: "Client Report", img: CDN.report, desc: "A premium, branded report preview showing the floor plan, efficiency score, and full budget summary — ready to send as a PDF or shareable link." },
  ];

  return (
    <section id="preview" className="py-24 md:py-32 bg-[#0A1628] overflow-hidden">
      <div className="container">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">App Preview</span>
            </div>
            <h2 className="font-['Montserrat'] font-black text-3xl md:text-5xl text-white mb-4">
              See It Before You<br />
              <span className="text-gold-gradient">Sign Up.</span>
            </h2>
          </motion.div>
        </AnimatedSection>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-2 mb-10">
          {screens.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-['Montserrat'] font-600 transition-all duration-200 ${
                active === i
                  ? "bg-[#D4AF37] text-[#0F1F3D]"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
          >
            {/* Screen */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-3xl blur-3xl" />
              <img
                src={screens[active].img}
                alt={screens[active].label}
                className={`relative z-10 rounded-2xl shadow-2xl shadow-black/60 border border-white/10 ${
                  active === 2 ? "w-full max-w-2xl" : "w-64 md:w-80"
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <h3 className="font-['Montserrat'] font-800 text-2xl md:text-3xl text-white mb-4">
                {screens[active].label}
              </h3>
              <p className="text-white/65 font-['Inter'] text-lg leading-relaxed mb-8">
                {screens[active].desc}
              </p>
              <a
                href="/start"
                className="btn-gold text-xs px-7 py-3.5 rounded-lg flex items-center gap-2"
              >
                Try It Free for 7 Days
                <ArrowRight size={15} />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────
function Pricing() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      key: "starter",
      name: "Starter",
      price: annual ? 83 : 99,
      period: annual ? "/mo, billed annually" : "/month",
      desc: "For individual brokers getting started with AI space intelligence.",
      features: [
        "10 test-fits per month",
        "PDF + shareable link export",
        "Broker-branded reports",
        "Budget estimator",
        "Space efficiency scoring",
        "Email support",
      ],
      cta: "Start Free Trial",
      highlight: false,
    },
    {
      key: "professional",
      name: "Professional",
      price: annual ? 166 : 199,
      period: annual ? "/mo, billed annually" : "/month",
      desc: "For active brokers who need unlimited analysis and white-labeling.",
      features: [
        "Unlimited test-fits",
        "White-label reports (your logo)",
        "Property comparison view",
        "Read receipts on shared reports",
        "Program templates library",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlight: true,
      badge: "Most Popular",
    },
    {
      key: "team",
      name: "Team",
      price: annual ? 124 : 149,
      period: annual ? "/user/mo, billed annually" : "/user/month",
      desc: "For brokerage teams that need collaboration and admin oversight.",
      features: [
        "Everything in Professional",
        "Team project visibility",
        "Co-broker sharing",
        "Referral program access",
        "Dedicated onboarding",
      ],
      cta: "Start Free Trial",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 bg-[#0D1B35]">
      <div className="container">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">Pricing</span>
            </div>
            <h2 className="font-['Montserrat'] font-black text-3xl md:text-5xl text-white mb-4">
              Simple, Transparent<br />
              <span className="text-gold-gradient">Pricing.</span>
            </h2>
            <p className="text-white/60 font-['Inter'] text-lg max-w-xl mx-auto mb-8">
              7-day free trial on all plans. No credit card required to explore. Cancel anytime.
            </p>

            {/* Annual Toggle */}
            <div className="inline-flex items-center gap-3 bg-white/5 rounded-full p-1.5">
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-['Montserrat'] font-600 transition-all ${
                  !annual ? "bg-[#D4AF37] text-[#0F1F3D]" : "text-white/60"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-['Montserrat'] font-600 transition-all flex items-center gap-2 ${
                  annual ? "bg-[#D4AF37] text-[#0F1F3D]" : "text-white/60"
                }`}
              >
                Annual
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${annual ? "bg-[#0F1F3D]/20" : "bg-[#D4AF37]/20 text-[#D4AF37]"}`}>
                  Save 17%
                </span>
              </button>
            </div>
          </motion.div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <AnimatedSection key={i}>
              <motion.div
                variants={fadeUp}
                className={`rounded-2xl p-7 relative flex flex-col ${
                  plan.highlight
                    ? "bg-gradient-to-b from-[#1A2B4A] to-[#0F1F3D] border border-[#D4AF37]/40 shadow-2xl shadow-[#D4AF37]/10"
                    : "card-glow"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0F1F3D] text-xs font-['Montserrat'] font-800 uppercase tracking-wider px-4 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-['Montserrat'] font-800 text-white text-xl mb-1">{plan.name}</h3>
                  <p className="text-white/50 text-sm font-['Inter'] mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Montserrat'] font-black text-4xl text-white">${plan.price}</span>
                    <span className="text-white/40 text-sm font-['Inter']">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm font-['Inter'] text-white/70">
                      <CheckCircle size={15} className="text-[#D4AF37] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={`/start?plan=${(plan as any).key}&interval=${annual ? 'year' : 'month'}`}
                  className={`w-full py-3.5 rounded-xl text-sm font-['Montserrat'] font-700 uppercase tracking-wide transition-all text-center block ${
                    plan.highlight
                      ? "btn-gold"
                      : "border border-white/20 text-white hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
                  }`}
                >
                  {plan.cta}
                </a>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Enterprise note */}
        <AnimatedSection>
          <motion.div variants={fadeUp} className="text-center mt-10">
            <p className="text-white/40 font-['Inter'] text-sm">
              Need a custom Enterprise plan for a large brokerage?{" "}
              <a
                href="mailto:hello@leasibility.ai"
                className="text-[#D4AF37] hover:underline"
              >
                Contact us for custom pricing.
              </a>
            </p>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      quote: "I sent a test-fit and budget estimate to my client before I even got back to my car. That kind of speed changes the conversation entirely.",
      name: "Michael T.",
      title: "Tenant Rep Broker, Chicago",
      stars: 5,
    },
    {
      quote: "The budget range feature alone is worth the subscription. I used to spend hours pulling together rough numbers. Now it's part of every tour report.",
      name: "Sarah L.",
      title: "Senior Associate, NYC",
      stars: 5,
    },
    {
      quote: "My clients are genuinely impressed when they receive a branded report with three layout options the same day as the tour. It sets me apart from every other broker they've met.",
      name: "David R.",
      title: "Principal, Los Angeles",
      stars: 5,
    },
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-[#0A1628]">
      <div className="container">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">Broker Feedback</span>
            </div>
            <h2 className="font-['Montserrat'] font-black text-3xl md:text-5xl text-white">
              What Brokers Are<br />
              <span className="text-gold-gradient">Saying.</span>
            </h2>
          </motion.div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <AnimatedSection key={i}>
              <motion.div variants={fadeUp} className="card-glow rounded-2xl p-7 flex flex-col gap-5">
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} fill="#D4AF37" className="text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-white/75 font-['Inter'] text-base leading-relaxed flex-1">
                  "{t.quote}"
                </p>
                <div>
                  <div className="font-['Montserrat'] font-700 text-white text-sm">{t.name}</div>
                  <div className="text-white/40 text-xs font-['Inter']">{t.title}</div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1F3D] via-[#1A2B4A] to-[#0A1628]" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      {/* Gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/8 rounded-full blur-3xl" />

      <div className="relative container text-center">
        <AnimatedSection>
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-6">
              <TrendingUp size={13} className="text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">Get Started Today</span>
            </div>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="font-['Montserrat'] font-black text-4xl md:text-6xl text-white mb-6 leading-tight"
          >
            Stop Leaving Certainty<br />
            <span className="text-gold-gradient">on the Table.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-white/65 font-['Inter'] text-xl max-w-2xl mx-auto mb-10"
          >
            Every tour is a moment of uncertainty for your client. Leasibility AI turns that moment into a decision point — with a branded feasibility report in hand before you leave the building. Start your 7-day free trial today.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto justify-center"
          >
            <a
              href="/start"
              className="btn-gold text-sm px-8 py-4 rounded-xl whitespace-nowrap flex items-center justify-center gap-2"
            >
              Start Your 7-Day Free Trial
              <ArrowRight size={16} />
            </a>
          </motion.div>

          <motion.p variants={fadeUp} className="text-white/30 text-xs font-['Inter'] mt-4">
            7-day free trial. No credit card required. Cancel anytime.
          </motion.p>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#080F1E] border-t border-white/8 py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={CDN.icon} alt="Leasibility AI" className="w-8 h-8 rounded-lg" />
              <span className="font-['Montserrat'] font-800 text-white text-lg">
                Leasibility <span className="text-gold-gradient">AI</span>
              </span>
            </div>
            <p className="text-white/40 font-['Inter'] text-sm leading-relaxed max-w-xs">
              The operating system for tenant real estate execution. Built for commercial real estate brokers who demand clarity, speed, and confidence.
            </p>
            <p className="text-white/25 font-['Inter'] text-xs mt-4">
              A CREEL Solutions LLC product.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-['Montserrat'] font-700 text-white text-sm uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              {["Features", "How It Works", "Pricing", "App Preview"].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-white/40 hover:text-white text-sm font-['Inter'] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-['Montserrat'] font-700 text-white text-sm uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Terms of Service", action: () => window.location.href = "/terms" },
                { label: "Privacy Policy", action: () => window.location.href = "/privacy" },
                { label: "Data Security", action: () => window.location.href = "/security" },
                { label: "Contact", action: () => window.location.href = "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="text-white/40 hover:text-white text-sm font-['Inter'] transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs font-['Inter']">
            © 2026 CREEL Solutions LLC. All rights reserved. Leasibility AI is a trademark of CREEL Solutions LLC.
          </p>
          <p className="text-white/20 text-xs font-['Inter']">
            AI-generated estimates are approximations for feasibility only, not professional contractor bids.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page Assembly ────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Features />
      <AppPreview />
      <Pricing />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}
