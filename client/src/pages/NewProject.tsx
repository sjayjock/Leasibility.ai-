import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Upload, Camera, Building2,
  Users, Briefcase, Loader2, CheckCircle, X, FileText, ScanLine,
  ZapOff, Zap, RotateCcw, Trash2, Plus, ChevronLeft, ChevronRight,
  Smartphone, Info
} from "lucide-react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Legal", "Healthcare", "Media & Creative",
  "Real Estate", "Professional Services", "Education", "Government", "Retail",
  "Manufacturing", "Nonprofit", "Other",
];

const US_MARKETS = [
  "New York", "Los Angeles", "Chicago", "San Francisco", "Boston",
  "Washington DC", "Seattle", "Miami", "Dallas", "Houston",
  "Atlanta", "Denver", "Phoenix", "Austin", "Nashville",
  "Charlotte", "Minneapolis", "Philadelphia", "San Diego", "Portland",
  "Detroit", "Columbus", "Indianapolis", "Tampa", "Other",
];

const STEPS = ["Property", "Tenant Program", "Floor Plan"];
const MAX_SCAN_PHOTOS = 5;

const PLANNING_STYLES = [
  { id: "Balanced Standard", label: "Balanced Standard", desc: "Mix of open workstations, enclosed rooms, and collaboration." },
  { id: "Open / Collaborative", label: "Open / Collaborative", desc: "More team zones and shared work areas." },
  { id: "Private / Enclosed", label: "Private / Enclosed", desc: "More offices, focus rooms, and enclosed meeting space." },
];

interface CapturedPhoto {
  dataUrl: string;
  file: File;
  id: string;
}

export default function NewProject() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Step 1 — Property
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [market, setMarket] = useState("");
  const [totalSqFt, setTotalSqFt] = useState("");
  const [floorNumber, setFloorNumber] = useState("");

  // Step 2 — Tenant Program
  const [tenantName, setTenantName] = useState("");
  const [headcount, setHeadcount] = useState("");
  const [industry, setIndustry] = useState("");
  const [programMode, setProgramMode] = useState<"auto" | "custom">("auto");
  const [planningStyle, setPlanningStyle] = useState("Balanced Standard");
  const [programNotes, setProgramNotes] = useState("");

  // Step 3 — Floor Plan
  const [inputMethod, setInputMethod] = useState<"upload" | "scan">("upload");
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);
  const [floorPlanPreview, setFloorPlanPreview] = useState<string | null>(null);

  // Scan state
  const [scanActive, setScanActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraReady, setCameraReady] = useState(false);
  const [captureFlash, setCaptureFlash] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const createProject = trpc.projects.create.useMutation();
  const uploadFloorPlan = trpc.projects.uploadFloorPlan.useMutation();
  const analyzeProject = trpc.projects.analyze.useMutation();

  // Safe redirect — never navigate during render (prevents React error #310)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => { stopScan(); };
  }, []);

  if (loading || !isAuthenticated) return <LoadingScreen />;

  // ─── File Upload Handler ───────────────────────────────────
  const handleFileSelect = (file: File) => {
    if (file.size > 20 * 1024 * 1024) { toast.error("File must be under 20MB"); return; }
    setFloorPlanFile(file);
    const reader = new FileReader();
    reader.onload = e => setFloorPlanPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ─── Camera Scan ──────────────────────────────────────────
  const startScan = async (facing: "environment" | "user" = "environment") => {
    try {
      // Stop existing stream first
      streamRef.current?.getTracks().forEach(t => t.stop());
      setCameraReady(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        }
      });
      streamRef.current = stream;

      // Check torch support
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities() as any;
      setTorchSupported(!!capabilities?.torch);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
      setScanActive(true);
      setReviewMode(false);
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        toast.error("Camera access denied. Please allow camera access in your browser settings.");
      } else if (err?.name === "NotFoundError") {
        toast.error("No camera found on this device.");
      } else {
        toast.error("Could not start camera. Try switching to Upload mode.");
      }
    }
  };

  const toggleCamera = async () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    await startScan(next);
  };

  const toggleTorch = async () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;
    try {
      await videoTrack.applyConstraints({ advanced: [{ torch: !torchOn } as any] });
      setTorchOn(t => !t);
    } catch {
      toast.error("Torch not supported on this device.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;
    if (capturedPhotos.length >= MAX_SCAN_PHOTOS) {
      toast.error(`Maximum ${MAX_SCAN_PHOTOS} photos allowed. Remove one to continue.`);
      return;
    }

    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);

    // Flash effect
    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 150);

    c.toBlob(blob => {
      if (!blob) return;
      const id = `scan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const file = new File([blob], `${id}.jpg`, { type: "image/jpeg" });
      const dataUrl = c.toDataURL("image/jpeg", 0.92);
      setCapturedPhotos(prev => {
        const next = [...prev, { dataUrl, file, id }];
        setSelectedPhotoIdx(next.length - 1);
        return next;
      });
      toast.success(`Photo ${capturedPhotos.length + 1} captured`);
    }, "image/jpeg", 0.92);
  };

  const removePhoto = (id: string) => {
    setCapturedPhotos(prev => {
      const next = prev.filter(p => p.id !== id);
      setSelectedPhotoIdx(Math.min(selectedPhotoIdx, next.length - 1));
      return next;
    });
  };

  const stopScan = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanActive(false);
    setCameraReady(false);
    setTorchOn(false);
  };

  const confirmScanPhotos = () => {
    if (capturedPhotos.length === 0) return;
    // Use the first photo as the primary floor plan file
    // (all photos will be sent as additional context via programNotes if multiple)
    const primary = capturedPhotos[0];
    setFloorPlanFile(primary.file);
    setFloorPlanPreview(primary.dataUrl);

    // If multiple photos, note them for AI context
    if (capturedPhotos.length > 1) {
      const note = `[${capturedPhotos.length} scan photos captured on-site]`;
      setProgramNotes(prev => prev ? `${prev}\n${note}` : note);
    }

    stopScan();
    setCapturedPhotos([]);
    setReviewMode(false);
    toast.success(`Floor plan scan confirmed — ${capturedPhotos.length > 1 ? `${capturedPhotos.length} photos` : "1 photo"} ready for analysis.`);
  };

  const resetScan = () => {
    stopScan();
    setCapturedPhotos([]);
    setFloorPlanFile(null);
    setFloorPlanPreview(null);
    setReviewMode(false);
  };

  // ─── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      setIsAnalyzing(true);

      let projectId = createdId;
      if (!projectId) {
        const result = await createProject.mutateAsync({
          propertyName,
          propertyAddress: propertyAddress || undefined,
          market: market || undefined,
          city: market || undefined,
          totalSqFt: parseInt(totalSqFt),
          floorNumber: floorNumber || undefined,
          inputMethod,
          tenantName: tenantName || undefined,
          headcount: parseInt(headcount),
          industry,
          programNotes: [
            `Program Mode: ${programMode === "auto" ? "Auto Programming" : "Custom Programming"}`,
            `Planning Style: ${planningStyle}`,
            programMode === "custom" && programNotes.trim() ? `Custom Requirements:\n${programNotes.trim()}` : programNotes.trim(),
          ].filter(Boolean).join("\n") || undefined,
        });
        projectId = result.id;
        setCreatedId(projectId);
      }

      if (floorPlanFile && floorPlanPreview) {
        const base64 = floorPlanPreview.split(",")[1];
        await uploadFloorPlan.mutateAsync({
          projectId,
          base64,
          mimeType: floorPlanFile.type,
          filename: floorPlanFile.name,
        });
      }

      await analyzeProject.mutateAsync({ projectId });
      navigate(`/project/${projectId}`);
    } catch (err: any) {
      setIsAnalyzing(false);
      toast.error(err?.message ?? "Analysis failed. Please try again.");
    }
  };

  const canProceedStep0 = propertyName.trim() && totalSqFt && parseInt(totalSqFt) >= 500 && market;
  const canProceedStep1 = headcount && parseInt(headcount) >= 1 && industry;

  if (isAnalyzing) return <AnalyzingScreen propertyName={propertyName} />;

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Header */}
      <header className="border-b border-white/8 bg-[#0A1628]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/dashboard")} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm font-['Inter']">{step > 0 ? "Back" : "Dashboard"}</span>
          </button>
          <div className="flex items-center gap-3">
            <img src={CDN_ICON} alt="" className="w-7 h-7 rounded-lg" />
            <span className="font-['Montserrat'] font-700 text-sm text-white">New Project</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-['Montserrat'] font-700 shrink-0 transition-all ${
                i < step ? "bg-[#D4AF37] text-[#0F1F3D]" :
                i === step ? "bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37]" :
                "bg-white/5 border border-white/10 text-white/30"
              }`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-['Inter'] truncate ${i === step ? "text-white" : "text-white/30"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-1 ${i < step ? "bg-[#D4AF37]/50" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        {/* ── Step 0: Property ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-1">Property Details</h2>
              <p className="text-white/50 font-['Inter'] text-sm">Tell us about the space you're evaluating.</p>
            </div>

            <Field label="Property Name *" hint="e.g. 200 Park Ave, 15th Floor">
              <input value={propertyName} onChange={e => setPropertyName(e.target.value)} placeholder="e.g. 200 Park Avenue" className="input-field" />
            </Field>

            <Field label="Street Address">
              <input value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} placeholder="Full street address" className="input-field" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Market / City *">
                <select value={market} onChange={e => setMarket(e.target.value)} className="input-field">
                  <option value="">Select market</option>
                  {US_MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Floor Number">
                <input value={floorNumber} onChange={e => setFloorNumber(e.target.value)} placeholder="e.g. 15" className="input-field" />
              </Field>
            </div>

            <Field label="Total Square Footage *" hint="Rentable square feet of the space">
              <input type="number" inputMode="numeric" value={totalSqFt} onChange={e => setTotalSqFt(e.target.value)} placeholder="e.g. 8500" min="500" max="100000" className="input-field no-spinner" />
            </Field>

            <button
              onClick={() => setStep(1)}
              disabled={!canProceedStep0}
              className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] disabled:opacity-40 disabled:cursor-not-allowed text-[#0F1F3D] font-['Montserrat'] font-700 text-sm py-4 rounded-xl transition-colors mt-4"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 1: Tenant Program ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-1">Tenant Program</h2>
              <p className="text-white/50 font-['Inter'] text-sm">Help the AI understand who will occupy the space.</p>
            </div>

            <Field label="Tenant / Company Name">
              <input value={tenantName} onChange={e => setTenantName(e.target.value)} placeholder="e.g. Acme Corp" className="input-field" />
            </Field>

            <Field label="Headcount *" hint="Number of people who will work in this space">
              <input type="number" inputMode="numeric" value={headcount} onChange={e => setHeadcount(e.target.value)} placeholder="e.g. 45" min="1" max="5000" className="input-field no-spinner" />
            </Field>

            <Field label="Industry *" hint="Used as context for language and assumptions; it is not the sole programming driver.">
              <select value={industry} onChange={e => setIndustry(e.target.value)} className="input-field">
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>

            <Field label="Programming Method" hint="Auto Programming generates a canonical program from headcount and planning style; Custom Programming lets you override it with specific requirements.">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "auto" as const, label: "Auto Programming", desc: "Recommended MVP flow" },
                  { id: "custom" as const, label: "Custom Programming", desc: "Use explicit room requests" },
                ].map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setProgramMode(option.id)}
                    className={`text-left rounded-xl border p-4 transition-all ${programMode === option.id ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-white/10 bg-[#0F1F3D] hover:border-white/20"}`}
                  >
                    <span className={`block font-['Montserrat'] font-700 text-sm ${programMode === option.id ? "text-[#D4AF37]" : "text-white/70"}`}>{option.label}</span>
                    <span className="block text-white/35 text-xs font-['Inter'] mt-1">{option.desc}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Auto Planning Style" hint="Available in Auto and Custom modes; custom notes can further override these defaults.">
              <div className="grid gap-3 sm:grid-cols-3">
                {PLANNING_STYLES.map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setPlanningStyle(style.id)}
                    className={`text-left rounded-xl border p-4 transition-all ${planningStyle === style.id ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-white/10 bg-[#0F1F3D] hover:border-white/20"}`}
                  >
                    <span className={`block font-['Montserrat'] font-700 text-sm ${planningStyle === style.id ? "text-[#D4AF37]" : "text-white/70"}`}>{style.label}</span>
                    <span className="block text-white/35 text-xs font-['Inter'] mt-1">{style.desc}</span>
                  </button>
                ))}
              </div>
            </Field>

            {headcount && totalSqFt && (
              <div className="bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={14} className="text-[#D4AF37]" />
                  <span className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 uppercase tracking-wider">Space Ratio</span>
                </div>
                <p className="text-white text-sm font-['Inter']">
                  <strong className="text-[#D4AF37]">{Math.round(parseInt(totalSqFt) / parseInt(headcount))} sq ft</strong> per person —{" "}
                  {parseInt(totalSqFt) / parseInt(headcount) < 100 ? "very dense (consider a larger space)" :
                   parseInt(totalSqFt) / parseInt(headcount) < 150 ? "dense, collaborative-forward" :
                   parseInt(totalSqFt) / parseInt(headcount) < 250 ? "standard density" :
                   "spacious, private-forward"}
                </p>
              </div>
            )}

            <Field label={programMode === "custom" ? "Custom Program Requirements" : "Program Notes"} hint={programMode === "custom" ? "List exact requested rooms, quantities, or special constraints. These will be sent as custom requirements." : "Optional constraints or preferences. Auto Programming will still create the baseline room program."}>
              <textarea
                value={programNotes}
                onChange={e => setProgramNotes(e.target.value)}
                placeholder={programMode === "custom" ? "e.g. 2 large conference rooms, 8 private offices, 45 workstations, reception, wellness room..." : "e.g. Need a larger boardroom, avoid moving existing pantry, prefer more focus rooms..."}
                rows={3}
                className="input-field resize-none"
              />
            </Field>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] disabled:opacity-40 disabled:cursor-not-allowed text-[#0F1F3D] font-['Montserrat'] font-700 text-sm py-4 rounded-xl transition-colors mt-4"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 2: Floor Plan ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-1">Floor Plan</h2>
              <p className="text-white/50 font-['Inter'] text-sm">Upload a file or scan the space live with your camera.</p>
            </div>

            {/* Method Toggle */}
            {!scanActive && !floorPlanPreview && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "upload" as const, icon: Upload, label: "Upload File", desc: "PDF, JPG, or PNG" },
                  { id: "scan" as const, icon: Smartphone, label: "Scan On-Site", desc: "Use your camera live" },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setInputMethod(m.id); setFloorPlanFile(null); setFloorPlanPreview(null); setCapturedPhotos([]); }}
                    className={`flex flex-col items-center gap-2 p-5 rounded-xl border transition-all ${
                      inputMethod === m.id
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : "border-white/10 bg-[#0F1F3D] hover:border-white/20"
                    }`}
                  >
                    <m.icon size={22} className={inputMethod === m.id ? "text-[#D4AF37]" : "text-white/40"} />
                    <span className={`font-['Montserrat'] font-700 text-sm ${inputMethod === m.id ? "text-white" : "text-white/50"}`}>{m.label}</span>
                    <span className="text-white/30 text-xs font-['Inter']">{m.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Upload Zone ── */}
            {inputMethod === "upload" && !floorPlanPreview && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
                className="border-2 border-dashed border-white/15 hover:border-[#D4AF37]/40 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
              >
                <Upload size={32} className="text-white/20 group-hover:text-[#D4AF37]/60 mx-auto mb-3 transition-colors" />
                <p className="text-white/60 font-['Inter'] text-sm mb-1">Drop your floor plan here or <span className="text-[#D4AF37]">browse files</span></p>
                <p className="text-white/25 text-xs font-['Inter']">PDF, JPG, PNG — max 20MB</p>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
              </div>
            )}

            {/* ── Confirmed Preview (upload or scan) ── */}
            {floorPlanPreview && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/30">
                  <img src={floorPlanPreview} alt="Floor plan" className="w-full max-h-64 object-contain bg-[#0F1F3D]" />
                  <button
                    onClick={() => { setFloorPlanFile(null); setFloorPlanPreview(null); setCapturedPhotos([]); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-emerald-400" />
                    <span className="text-white text-xs font-['Inter']">
                      {inputMethod === "scan" ? "Scan confirmed" : floorPlanFile?.name}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Scan UI ── */}
            {inputMethod === "scan" && !floorPlanPreview && (
              <div className="space-y-3">
                {/* Scan tip */}
                {!scanActive && capturedPhotos.length === 0 && (
                  <div className="bg-[#0F1F3D] border border-white/8 rounded-xl p-4 flex gap-3">
                    <Info size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-white/70 font-['Inter'] text-sm font-500">On-site scanning tips</p>
                      <ul className="text-white/40 text-xs font-['Inter'] space-y-1">
                        <li>• Point at the floor plan posted in the lobby or leasing brochure</li>
                        <li>• Capture up to {MAX_SCAN_PHOTOS} photos from different angles</li>
                        <li>• Use the torch button in low-light conditions</li>
                        <li>• Hold steady — the AI works best with sharp, well-lit images</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Start button */}
                {!scanActive && capturedPhotos.length === 0 && (
                  <button
                    onClick={() => startScan(facingMode)}
                    className="w-full flex items-center justify-center gap-2 bg-[#0F1F3D] border border-white/10 hover:border-[#D4AF37]/40 text-white font-['Montserrat'] font-700 text-sm py-5 rounded-xl transition-colors"
                  >
                    <Camera size={18} className="text-[#D4AF37]" />
                    Start Camera
                  </button>
                )}

                {/* Live camera viewfinder */}
                {scanActive && (
                  <div className="space-y-3">
                    {/* Viewfinder */}
                    <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10">
                      {/* Video */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full object-cover"
                        style={{ maxHeight: "60vh", minHeight: "240px" }}
                      />

                      {/* Capture flash overlay */}
                      {captureFlash && (
                        <div className="absolute inset-0 bg-white/70 pointer-events-none" />
                      )}

                      {/* Framing overlay */}
                      {cameraReady && (
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Corner brackets */}
                          <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-lg" />
                          <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-[#D4AF37] rounded-tr-lg" />
                          <div className="absolute bottom-16 left-6 w-10 h-10 border-b-2 border-l-2 border-[#D4AF37] rounded-bl-lg" />
                          <div className="absolute bottom-16 right-6 w-10 h-10 border-b-2 border-r-2 border-[#D4AF37] rounded-br-lg" />
                          {/* Guide text */}
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                            <span className="text-[#D4AF37] text-xs font-['Inter']">Align floor plan within frame</span>
                          </div>
                          {/* Photo count badge */}
                          <div className="absolute top-4 right-4 bg-black/70 rounded-full px-2.5 py-1">
                            <span className="text-white text-xs font-['Montserrat'] font-700">{capturedPhotos.length}/{MAX_SCAN_PHOTOS}</span>
                          </div>
                        </div>
                      )}

                      {/* Loading spinner while camera initialises */}
                      {!cameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <Loader2 size={28} className="text-[#D4AF37] animate-spin" />
                        </div>
                      )}

                      {/* Bottom controls bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-6">
                        <div className="flex items-center justify-between">
                          {/* Torch */}
                          <button
                            onClick={toggleTorch}
                            disabled={!torchSupported}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                              torchSupported
                                ? torchOn ? "bg-[#D4AF37] text-[#0F1F3D]" : "bg-white/10 text-white hover:bg-white/20"
                                : "bg-white/5 text-white/20 cursor-not-allowed"
                            }`}
                            title={torchSupported ? (torchOn ? "Turn off torch" : "Turn on torch") : "Torch not available"}
                          >
                            {torchOn ? <Zap size={16} /> : <ZapOff size={16} />}
                          </button>

                          {/* Capture button */}
                          <button
                            onClick={capturePhoto}
                            disabled={!cameraReady || capturedPhotos.length >= MAX_SCAN_PHOTOS}
                            className="w-16 h-16 rounded-full bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center shadow-lg"
                          >
                            <div className="w-12 h-12 rounded-full border-2 border-[#0A1628]/20" />
                          </button>

                          {/* Flip camera */}
                          <button
                            onClick={toggleCamera}
                            className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                            title="Flip camera"
                          >
                            <RotateCcw size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <canvas ref={canvasRef} className="hidden" />

                    {/* Photo strip */}
                    {capturedPhotos.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/50 text-xs font-['Inter']">{capturedPhotos.length} photo{capturedPhotos.length > 1 ? "s" : ""} captured</span>
                          <button
                            onClick={() => { stopScan(); setReviewMode(true); }}
                            className="text-[#D4AF37] text-xs font-['Montserrat'] font-700 hover:underline"
                          >
                            Review & Confirm →
                          </button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {capturedPhotos.map((p, i) => (
                            <div key={p.id} className="relative shrink-0">
                              <img
                                src={p.dataUrl}
                                alt={`Scan ${i + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border border-white/15"
                              />
                              <button
                                onClick={() => removePhoto(p.id)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                              >
                                <X size={10} className="text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cancel scan */}
                    <button
                      onClick={resetScan}
                      className="w-full flex items-center justify-center gap-2 border border-white/15 text-white/50 hover:text-white font-['Inter'] text-sm py-3 rounded-xl transition-colors"
                    >
                      <X size={14} /> Cancel Scan
                    </button>
                  </div>
                )}

                {/* Review mode — after stopping camera */}
                {!scanActive && reviewMode && capturedPhotos.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-['Montserrat'] font-700 text-white text-base">Review Photos</h3>
                      <span className="text-white/40 text-xs font-['Inter']">{capturedPhotos.length} photo{capturedPhotos.length > 1 ? "s" : ""}</span>
                    </div>

                    {/* Large preview */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0F1F3D]">
                      <img
                        src={capturedPhotos[selectedPhotoIdx]?.dataUrl}
                        alt={`Photo ${selectedPhotoIdx + 1}`}
                        className="w-full max-h-64 object-contain"
                      />
                      {capturedPhotos.length > 1 && (
                        <>
                          <button
                            onClick={() => setSelectedPhotoIdx(i => Math.max(0, i - 1))}
                            disabled={selectedPhotoIdx === 0}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/80 transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => setSelectedPhotoIdx(i => Math.min(capturedPhotos.length - 1, i + 1))}
                            disabled={selectedPhotoIdx === capturedPhotos.length - 1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/80 transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </>
                      )}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-2.5 py-0.5">
                        <span className="text-white/70 text-xs font-['Inter']">{selectedPhotoIdx + 1} / {capturedPhotos.length}</span>
                      </div>
                    </div>

                    {/* Thumbnail strip */}
                    {capturedPhotos.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {capturedPhotos.map((p, i) => (
                          <div key={p.id} className="relative shrink-0">
                            <button onClick={() => setSelectedPhotoIdx(i)}>
                              <img
                                src={p.dataUrl}
                                alt={`Scan ${i + 1}`}
                                className={`w-14 h-14 object-cover rounded-lg transition-all ${
                                  i === selectedPhotoIdx ? "border-2 border-[#D4AF37]" : "border border-white/15 opacity-60"
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => removePhoto(p.id)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                            >
                              <X size={10} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => { setReviewMode(false); startScan(facingMode); }}
                        className="flex items-center justify-center gap-2 border border-white/15 text-white/60 hover:text-white font-['Inter'] text-sm py-3 rounded-xl transition-colors"
                      >
                        <Plus size={14} /> Add More
                      </button>
                      <button
                        onClick={confirmScanPhotos}
                        className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-700 text-sm py-3 rounded-xl transition-colors"
                      >
                        <CheckCircle size={14} /> Use These
                      </button>
                    </div>

                    <button
                      onClick={resetScan}
                      className="w-full text-white/30 hover:text-white/60 font-['Inter'] text-xs py-2 transition-colors"
                    >
                      Start over
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c49b2e] text-[#0F1F3D] font-['Montserrat'] font-700 text-sm py-4 rounded-xl transition-colors mt-2"
            >
              <FileText size={16} />
              Generate AI Scenarios
            </button>

            {!floorPlanFile && (
              <p className="text-white/30 text-xs font-['Inter'] text-center">
                No floor plan? No problem — the AI will generate scenarios based on your program inputs alone.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/80 text-sm font-['Inter'] font-500 mb-1.5">{label}</label>
      {hint && <p className="text-white/35 text-xs font-['Inter'] mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
    </div>
  );
}

function AnalyzingScreen({ propertyName }: { propertyName: string }) {
  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-6">
        <Loader2 size={36} className="text-[#D4AF37] animate-spin" />
      </div>
      <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-3">Analyzing the Space</h2>
      <p className="text-white/50 font-['Inter'] text-sm max-w-sm mb-2">
        Leasibility AI is generating scenario plans for <strong className="text-white">{propertyName}</strong>.
      </p>
      <p className="text-white/30 font-['Inter'] text-xs">
        Calculating space layouts, budget ranges, and schedule forecasts...
      </p>
      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}
