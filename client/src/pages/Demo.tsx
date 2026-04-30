import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Clock, DollarSign, BarChart3, FileText, CheckCircle, Loader2, Lock, X } from "lucide-react";
import { useLocation } from "wouter";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

// ─── Pre-built demo data (Option A: static, instant, no AI cost) ───────────────

const DEMO_SCENARIOS = [
  {
    id: "tech-10k",
    label: "10,000 SF Office",
    subtitle: "Tech Company — NYC",
    headcount: 42,
    sqft: 10000,
    market: "New York, NY",
    industry: "Technology",
    scenarios: [
      {
        name: "Light Refresh",
        tag: "lightRefresh",
        color: "#60A5FA",
        efficiency: 82,
        budgetLow: 85,
        budgetHigh: 115,
        timelineWeeks: 8,
        workstations: 38,
        offices: 2,
        confRooms: 2,
        highlights: ["Paint & carpet refresh", "Updated lighting", "Minor partition work", "Furniture refresh"],
      },
      {
        name: "Moderate Build-Out",
        tag: "moderateBuildOut",
        color: "#D4AF37",
        efficiency: 88,
        budgetLow: 145,
        budgetHigh: 185,
        timelineWeeks: 14,
        workstations: 42,
        offices: 4,
        confRooms: 3,
        highlights: ["New open plan layout", "Glass-front offices", "2 collaboration zones", "Full AV integration"],
      },
      {
        name: "Full Transformation",
        tag: "fullTransformation",
        color: "#A78BFA",
        efficiency: 94,
        budgetLow: 220,
        budgetHigh: 280,
        timelineWeeks: 22,
        workstations: 44,
        offices: 6,
        confRooms: 4,
        highlights: ["Ground-up interior design", "Custom millwork", "Branded reception", "Wellness + focus rooms"],
      },
    ],
  },
  {
    id: "hq-25k",
    label: "25,000 SF HQ Relocation",
    subtitle: "Financial Services — Chicago",
    headcount: 105,
    sqft: 25000,
    market: "Chicago, IL",
    industry: "Financial Services",
    scenarios: [
      {
        name: "Light Refresh",
        tag: "lightRefresh",
        color: "#60A5FA",
        efficiency: 79,
        budgetLow: 75,
        budgetHigh: 100,
        timelineWeeks: 10,
        workstations: 95,
        offices: 6,
        confRooms: 4,
        highlights: ["Cosmetic refresh only", "Reuse existing layout", "New signage & branding", "Lighting upgrade"],
      },
      {
        name: "Moderate Build-Out",
        tag: "moderateBuildOut",
        color: "#D4AF37",
        efficiency: 86,
        budgetLow: 130,
        budgetHigh: 165,
        timelineWeeks: 18,
        workstations: 105,
        offices: 10,
        confRooms: 6,
        highlights: ["Reconfigured floor plan", "Executive suite", "Trading floor layout", "Full IT infrastructure"],
      },
      {
        name: "Full Transformation",
        tag: "fullTransformation",
        color: "#A78BFA",
        efficiency: 92,
        budgetLow: 195,
        budgetHigh: 245,
        timelineWeeks: 28,
        workstations: 110,
        offices: 14,
        confRooms: 8,
        highlights: ["Custom HQ design", "Client entertainment floor", "Rooftop terrace access", "Smart building systems"],
      },
    ],
  },
  {
    id: "prof-15k",
    label: "15,000 SF Professional Services",
    subtitle: "Law Firm — Los Angeles",
    headcount: 58,
    sqft: 15000,
    market: "Los Angeles, CA",
    industry: "Legal",
    scenarios: [
      {
        name: "Light Refresh",
        tag: "lightRefresh",
        color: "#60A5FA",
        efficiency: 80,
        budgetLow: 90,
        budgetHigh: 120,
        timelineWeeks: 9,
        workstations: 50,
        offices: 8,
        confRooms: 3,
        highlights: ["Carpet & paint refresh", "Updated reception", "New partner office doors", "Lighting upgrade"],
      },
      {
        name: "Moderate Build-Out",
        tag: "moderateBuildOut",
        color: "#D4AF37",
        efficiency: 87,
        budgetLow: 155,
        budgetHigh: 195,
        timelineWeeks: 16,
        workstations: 55,
        offices: 12,
        confRooms: 5,
        highlights: ["Partner office row", "Client conference suite", "Library & research room", "Secure file storage"],
      },
      {
        name: "Full Transformation",
        tag: "fullTransformation",
        color: "#A78BFA",
        efficiency: 93,
        budgetLow: 230,
        budgetHigh: 290,
        timelineWeeks: 24,
        workstations: 58,
        offices: 16,
        confRooms: 6,
        highlights: ["Prestige lobby design", "Partner suites with views", "Client hospitality floor", "Full AV & security"],
      },
    ],
  },
];

// ─── Loading steps ─────────────────────────────────────────────
const LOADING_STEPS = [
  "Interpreting floor plan geometry...",
  "Mapping program to space...",
  "Benchmarking against market data...",
  "Generating 3 build-out scenarios...",
  "Calculating efficiency scores...",
  "Finalizing budget ranges...",
];

// ─── Scenario Card ─────────────────────────────────────────────
function ScenarioCard({ scenario, index, isBlurred }: {
  scenario: typeof DEMO_SCENARIOS[0]["scenarios"][0];
  index: number;
  isBlurred: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className={`relative rounded-2xl border bg-[#0D1B35] p-5 transition-all ${
        isBlurred ? "blur-sm select-none pointer-events-none" : ""
      }`}
      style={{ borderColor: `${scenario.color}30` }}
    >
      {/* Scenario name */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span
            className="text-xs font-['Montserrat'] font-700 uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ color: scenario.color, backgroundColor: `${scenario.color}15` }}
          >
            {scenario.name}
          </span>
        </div>
        <div className="text-right">
          <div className="font-['Montserrat'] font-black text-2xl" style={{ color: scenario.color }}>
            {scenario.efficiency}%
          </div>
          <div className="text-white/40 text-xs font-['Inter']">Efficiency</div>
        </div>
      </div>

      {/* Budget */}
      <div className="bg-white/4 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign size={13} className="text-[#D4AF37]" />
          <span className="text-white/50 text-xs font-['Inter']">Budget Estimate</span>
        </div>
        <div className="font-['Montserrat'] font-800 text-white text-lg">
          ${scenario.budgetLow}–${scenario.budgetHigh} <span className="text-white/40 text-sm font-400">/ sq ft</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-white/4 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Clock size={12} className="text-[#D4AF37]" />
            <span className="text-white/50 text-xs font-['Inter']">Timeline</span>
          </div>
          <div className="font-['Montserrat'] font-700 text-white text-base">{scenario.timelineWeeks} weeks</div>
        </div>
        <div className="flex-1 bg-white/4 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <BarChart3 size={12} className="text-[#D4AF37]" />
            <span className="text-white/50 text-xs font-['Inter']">Workstations</span>
          </div>
          <div className="font-['Montserrat'] font-700 text-white text-base">{scenario.workstations}</div>
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-1.5">
        {scenario.highlights.map((h, i) => (
          <div key={i} className="flex items-center gap-2 text-white/60 text-xs font-['Inter']">
            <CheckCircle size={11} style={{ color: scenario.color }} className="shrink-0" />
            {h}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Demo Page ─────────────────────────────────────────────
export default function Demo() {
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const activeDemo = DEMO_SCENARIOS.find(d => d.id === selected);

  const handleGenerate = () => {
    if (!selected) return;
    setLoading(true);
    setLoadStep(0);
    setShowResult(false);
    setShowGate(false);

    // Cycle through loading steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setLoadStep(step);
      if (step >= LOADING_STEPS.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
          setShowResult(true);
          // Show soft gate after 2.5 seconds of viewing results
          setTimeout(() => setShowGate(true), 2500);
          // Scroll to results
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 200);
        }, 600);
      }
    }, 420);
  };

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Top bar */}
      <div className="border-b border-white/8 bg-[#0A1628]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src={CDN_ICON} alt="Leasibility AI" className="w-8 h-8 rounded-xl" />
            <span className="font-['Montserrat'] font-800 text-white text-base">
              Leasibility <span className="text-[#D4AF37]">AI</span>
            </span>
          </a>
          <a
            href="/start"
            className="btn-gold text-xs px-4 py-2 rounded-lg"
          >
            Start Free Trial
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-full px-4 py-1.5 mb-4">
            <Zap size={12} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-widest">
              Live Demo — No Login Required
            </span>
          </div>
          <h1 className="font-['Montserrat'] font-black text-3xl md:text-4xl text-white mb-3">
            Try a Test Fit Now
          </h1>
          <p className="text-white/55 font-['Inter'] text-base max-w-xl mx-auto">
            Select a deal scenario below, hit Generate, and see exactly what your client would receive — layouts, budgets, and timelines in seconds.
          </p>
        </motion.div>

        {/* Scenario Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {DEMO_SCENARIOS.map((demo, i) => (
            <motion.button
              key={demo.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => { setSelected(demo.id); setShowResult(false); setShowGate(false); }}
              className={`text-left rounded-2xl border p-5 transition-all duration-200 ${
                selected === demo.id
                  ? "border-[#D4AF37] bg-[#D4AF37]/8 shadow-lg shadow-[#D4AF37]/10"
                  : "border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5"
              }`}
            >
              <div className="font-['Montserrat'] font-800 text-white text-base mb-1">{demo.label}</div>
              <div className="text-white/50 font-['Inter'] text-sm">{demo.subtitle}</div>
              <div className="mt-3 flex items-center gap-3 text-white/40 text-xs font-['Inter']">
                <span>{demo.sqft.toLocaleString()} sq ft</span>
                <span>·</span>
                <span>{demo.headcount} people</span>
              </div>
              {selected === demo.id && (
                <div className="mt-2 flex items-center gap-1.5 text-[#D4AF37] text-xs font-['Montserrat'] font-700">
                  <CheckCircle size={11} />
                  Selected
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handleGenerate}
            disabled={!selected || loading}
            className={`btn-gold text-base px-10 py-4 rounded-xl flex items-center gap-3 transition-all ${
              !selected ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap size={18} />
                Generate Test Fit
              </>
            )}
          </button>
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto bg-[#0D1B35] border border-white/10 rounded-2xl p-8 text-center mb-12"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5">
                <Zap size={24} className="text-[#D4AF37]" />
              </div>
              <div className="space-y-2 mb-5">
                {LOADING_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`text-sm font-['Inter'] transition-all duration-300 ${
                      i <= loadStep ? "text-white/80" : "text-white/20"
                    }`}
                  >
                    {i < loadStep ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle size={12} className="text-[#D4AF37]" />
                        {step}
                      </span>
                    ) : i === loadStep ? (
                      <span className="flex items-center justify-center gap-2 text-[#D4AF37]">
                        <Loader2 size={12} className="animate-spin" />
                        {step}
                      </span>
                    ) : (
                      <span className="text-white/20">{step}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-white/30 text-xs font-['Inter']">This report was generated in 42 seconds.</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {showResult && activeDemo && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              {/* Result header */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-1">
                      Test-Fit Results — {activeDemo.label}
                    </h2>
                    <p className="text-white/50 font-['Inter'] text-sm">
                      {activeDemo.market} · {activeDemo.sqft.toLocaleString()} sq ft · {activeDemo.headcount} people · {activeDemo.industry}
                    </p>
                  </div>
                  <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-xl px-4 py-2 text-center">
                    <div className="text-[#D4AF37] font-['Montserrat'] font-800 text-sm">42 seconds</div>
                    <div className="text-white/40 text-xs font-['Inter']">Generation time</div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl">
                  <p className="text-[#D4AF37]/90 text-sm font-['Inter'] italic">
                    "This report was generated in 42 seconds. Brokers use this to follow up with clients before leaving the tour."
                  </p>
                </div>
              </motion.div>

              {/* Scenario cards — third one blurred */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
                {activeDemo.scenarios.map((scenario, i) => (
                  <ScenarioCard
                    key={scenario.tag}
                    scenario={scenario}
                    index={i}
                    isBlurred={i === 2 && showGate}
                  />
                ))}

                {/* Soft Gate Overlay */}
                <AnimatePresence>
                  {showGate && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center z-20"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#0A1628]/95 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-7 text-center max-w-sm mx-4 shadow-2xl shadow-black/60"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center mx-auto mb-4">
                          <Lock size={20} className="text-[#D4AF37]" />
                        </div>
                        <h3 className="font-['Montserrat'] font-black text-white text-xl mb-2">
                          Ready to run this on your own deal?
                        </h3>
                        <p className="text-white/55 font-['Inter'] text-sm mb-5 leading-relaxed">
                          Start your free trial to unlock all 3 scenarios, export branded reports, and analyze your own floor plans.
                        </p>
                        <a
                          href="/onboarding"
                          className="w-full btn-gold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-['Montserrat'] font-700 mb-3"
                        >
                          Start Free Trial — 7 Days Free
                          <ArrowRight size={15} />
                        </a>
                        <button
                          onClick={() => setShowGate(false)}
                          className="text-white/35 hover:text-white/60 text-xs font-['Inter'] transition-colors flex items-center gap-1 mx-auto"
                        >
                          <X size={11} />
                          Continue viewing demo
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom CTA banner */}
              {!showGate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 bg-gradient-to-r from-[#0F1F3D] to-[#0D1B35] border border-[#D4AF37]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-['Montserrat'] font-800 text-white text-lg mb-1">
                      Run this on your own deal
                    </div>
                    <div className="text-white/50 font-['Inter'] text-sm">
                      Upload a floor plan and get 3 scenarios + a branded report in under 60 seconds.
                    </div>
                  </div>
                  <a
                    href="/onboarding"
                    className="btn-gold px-7 py-3.5 rounded-xl text-sm font-['Montserrat'] font-700 flex items-center gap-2 shrink-0"
                  >
                    Start Free Trial
                    <ArrowRight size={15} />
                  </a>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
