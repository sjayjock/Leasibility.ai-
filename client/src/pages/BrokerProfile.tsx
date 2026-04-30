import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { ArrowLeft, Camera, Upload, User, Building2, Phone, Mail, Loader2, CheckCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrokerProfile() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Safe redirect — never navigate during render (prevents React error #310)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  const { data: profile, isLoading: profileLoading, refetch } = trpc.broker.getProfile.useQuery();

  const [form, setForm] = useState({
    brokerName: "",
    brokerTitle: "",
    brokerPhone: "",
    brokerEmail: "",
    brokerCompany: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Populate form from existing profile
  useEffect(() => {
    if (profile) {
      setForm({
        brokerName: profile.brokerName ?? "",
        brokerTitle: profile.brokerTitle ?? "",
        brokerPhone: profile.brokerPhone ?? "",
        brokerEmail: profile.brokerEmail ?? "",
        brokerCompany: profile.brokerCompany ?? "",
      });
      if (profile.brokerPhotoUrl) setPhotoPreview(profile.brokerPhotoUrl);
      if (profile.brokerLogoUrl) setLogoPreview(profile.brokerLogoUrl);
    }
  }, [profile]);

  const updateMutation = trpc.broker.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile saved successfully.");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const uploadPhotoMutation = trpc.broker.uploadPhoto.useMutation({
    onSuccess: (data: { url: string }) => {
      setPhotoPreview(data.url);
      toast.success("Photo uploaded.");
      refetch();
    },
    onError: (err: { message: string }) => toast.error(err.message),
    onSettled: () => setUploadingPhoto(false),
  });

  const uploadLogoMutation = trpc.broker.uploadLogo.useMutation({
    onSuccess: (data: { url: string }) => {
      setLogoPreview(data.url);
      toast.success("Logo uploaded.");
      refetch();
    },
    onError: (err: { message: string }) => toast.error(err.message),
    onSettled: () => setUploadingLogo(false),
  });

  const handleFileUpload = async (
    file: File,
    type: "photo" | "logo"
  ) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      if (type === "photo") {
        setUploadingPhoto(true);
        uploadPhotoMutation.mutate({ base64, mimeType: file.type, filename: file.name });
      } else {
        setUploadingLogo(true);
        uploadLogoMutation.mutate({ base64, mimeType: file.type, filename: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
      </div>
    );
  }

  const isComplete = form.brokerName && form.brokerTitle && form.brokerCompany && photoPreview;

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Top Nav */}
      <div className="border-b border-white/8 bg-[#0A1628]/95 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-['Inter']"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <span className="font-['Montserrat'] font-700 text-white">Broker Profile</span>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Montserrat'] font-black text-3xl text-white mb-2">Your Broker Profile</h1>
          <p className="text-white/55 font-['Inter']">
            This information appears on every exported client report. Complete your profile to brand every deliverable with your identity.
          </p>
        </div>

        {/* Profile Complete Banner */}
        {isComplete && (
          <div className="mb-8 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle size={18} className="text-green-400" />
            <span className="text-green-300 text-sm font-['Inter']">Your profile is complete. Every exported report will be branded with your information.</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Photo + Logo Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Headshot */}
            <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-6">
              <div className="text-white font-['Montserrat'] font-700 text-sm mb-1">Headshot</div>
              <div className="text-white/40 text-xs font-['Inter'] mb-4">Appears on report cover. Square photo recommended.</div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Broker photo" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-white/20" />
                  )}
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "photo");
                  }}
                />
                <Button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="bg-white/8 hover:bg-white/15 text-white border border-white/15 text-xs flex items-center gap-2"
                >
                  {uploadingPhoto ? (
                    <><Loader2 size={12} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><Camera size={12} /> {photoPreview ? "Change Photo" : "Upload Photo"}</>
                  )}
                </Button>
              </div>
            </div>

            {/* Brokerage Logo */}
            <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-6">
              <div className="text-white font-['Montserrat'] font-700 text-sm mb-1">Brokerage Logo</div>
              <div className="text-white/40 text-xs font-['Inter'] mb-4">Appears on report cover. PNG with transparent background recommended.</div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 border-2 border-white/10 flex items-center justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Brokerage logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <Building2 size={32} className="text-white/20" />
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "logo");
                  }}
                />
                <Button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="bg-white/8 hover:bg-white/15 text-white border border-white/15 text-xs flex items-center gap-2"
                >
                  {uploadingLogo ? (
                    <><Loader2 size={12} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload size={12} /> {logoPreview ? "Change Logo" : "Upload Logo"}</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Text Fields */}
          <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="text-white font-['Montserrat'] font-700 text-sm mb-2">Contact Information</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-white/60 text-xs font-['Inter'] mb-1.5">Full Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={form.brokerName}
                    onChange={(e) => setForm(f => ({ ...f, brokerName: e.target.value }))}
                    placeholder="Stephen Creel"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm font-['Inter'] placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-xs font-['Inter'] mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.brokerTitle}
                  onChange={(e) => setForm(f => ({ ...f, brokerTitle: e.target.value }))}
                  placeholder="Tenant Rep Broker"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-['Inter'] placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/60 text-xs font-['Inter'] mb-1.5">Brokerage / Company *</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={form.brokerCompany}
                    onChange={(e) => setForm(f => ({ ...f, brokerCompany: e.target.value }))}
                    placeholder="CREEL Solutions LLC"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm font-['Inter'] placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-xs font-['Inter'] mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="tel"
                    value={form.brokerPhone}
                    onChange={(e) => setForm(f => ({ ...f, brokerPhone: e.target.value }))}
                    placeholder="+1 (312) 555-0100"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm font-['Inter'] placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-white/60 text-xs font-['Inter'] mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={form.brokerEmail}
                    onChange={(e) => setForm(f => ({ ...f, brokerEmail: e.target.value }))}
                    placeholder="stephen@creelsolutions.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm font-['Inter'] placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-[#0D1B35] border border-white/10 rounded-2xl p-6">
            <div className="text-white font-['Montserrat'] font-700 text-sm mb-4">Report Preview</div>
            <div className="bg-[#0F1F3D] rounded-xl p-5 flex items-center gap-4 border border-white/8">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]/30" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center">
                  <User size={20} className="text-white/20" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-['Montserrat'] font-700 text-white">{form.brokerName || "Your Name"}</div>
                <div className="text-white/50 text-sm font-['Inter']">
                  {form.brokerTitle || "Your Title"}{form.brokerCompany ? ` · ${form.brokerCompany}` : ""}
                </div>
                <div className="text-white/40 text-xs font-['Inter'] mt-0.5">
                  {form.brokerPhone}{form.brokerEmail ? (form.brokerPhone ? ` · ${form.brokerEmail}` : form.brokerEmail) : ""}
                </div>
              </div>
              {logoPreview && (
                <img src={logoPreview} alt="Logo" className="h-10 object-contain opacity-80" />
              )}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full bg-[#D4AF37] hover:bg-[#c9a430] text-[#0F1F3D] font-['Montserrat'] font-700 py-3.5 text-sm uppercase tracking-wide flex items-center justify-center gap-2"
          >
            {updateMutation.isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Profile</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
