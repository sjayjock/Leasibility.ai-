import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa_install_dismissed";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed in this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) return; // Already installed

    if (ios) {
      setIsIOS(true);
      // Show iOS prompt after 30 seconds on mobile
      const timer = setTimeout(() => setShowBanner(true), 30000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after 20 seconds
      setTimeout(() => setShowBanner(true), 20000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-[#0F1F3D] border border-[#D4AF37]/30 rounded-2xl p-4 shadow-2xl shadow-black/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
              <Smartphone size={18} className="text-[#D4AF37]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm mb-0.5">Add to Home Screen</div>
              <div className="text-white/55 text-xs leading-relaxed">
                Get one-tap access to Leasibility AI on every tour — no browser needed.
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 mt-0.5"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleInstall}
              size="sm"
              className="flex-1 bg-[#D4AF37] hover:bg-[#C4A030] text-[#0A1628] font-semibold text-xs gap-1.5"
            >
              <Download size={13} />
              {isIOS ? "Show Me How" : "Install App"}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-white/40 hover:text-white/60 text-xs"
            >
              Not now
            </Button>
          </div>
        </div>
      </div>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-end justify-center p-4">
          <div className="bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-base">Add to Home Screen</h3>
              <button onClick={() => { setShowIOSGuide(false); setShowBanner(false); sessionStorage.setItem(DISMISSED_KEY, "1"); }}>
                <X size={18} className="text-white/40" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { step: "1", text: "Tap the Share button at the bottom of your browser (the box with an arrow pointing up)" },
                { step: "2", text: "Scroll down and tap \"Add to Home Screen\"" },
                { step: "3", text: "Tap \"Add\" in the top right corner" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0A1628] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="text-white/35 text-xs mt-4 text-center">
              Leasibility AI will appear as an app icon on your home screen.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
