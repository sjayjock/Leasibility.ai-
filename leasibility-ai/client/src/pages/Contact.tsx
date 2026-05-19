import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Mail, MessageSquare, Phone, CheckCircle2, Loader2 } from "lucide-react";

const CDN_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/7JsZLGf4EdmB4GV6zLgWpu/leasibility_app_icon_dbb8b85e.png";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const notify = trpc.system.notifyOwner.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error("Failed to send message. Please email us directly at hello@leasibility.ai");
      console.error(err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    notify.mutate({
      title: `Contact Form: ${form.subject || "New Inquiry"} — ${form.name}`,
      content: `**From:** ${form.name} (${form.email})\n**Company:** ${form.company || "Not provided"}\n**Subject:** ${form.subject || "General inquiry"}\n\n**Message:**\n${form.message}`,
    });
  };

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

      <div className="container max-w-5xl py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-6">
            <MessageSquare size={13} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-widest">Get in Touch</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            We'd Love to Hear From You
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Questions about the product, pricing, or a brokerage partnership? Send us a message and we'll respond within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left — contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
              <h2 className="text-white font-bold text-lg">Contact Information</h2>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Email</div>
                  <a href="mailto:hello@leasibility.ai" className="text-white hover:text-[#D4AF37] transition-colors text-sm">
                    hello@leasibility.ai
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Response Time</div>
                  <div className="text-white text-sm">Within 1 business day</div>
                </div>
              </div>
            </div>

            {/* Use cases */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-semibold text-sm">Common Inquiries</h3>
              {[
                "Brokerage firm or team pricing",
                "White-label or reseller partnerships",
                "Integration with your CRM or tech stack",
                "Demo request for your office",
                "Billing or account questions",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[400px] gap-5">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-[#D4AF37]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Message Sent</h2>
                <p className="text-white/60 max-w-sm">
                  Thanks for reaching out. We'll get back to you at <span className="text-white">{form.email}</span> within one business day.
                </p>
                <Link href="/">
                  <Button className="bg-[#D4AF37] hover:bg-[#C4A030] text-[#0A1628] font-semibold mt-2">
                    Back to Home
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-white/70 text-xs uppercase tracking-wider font-medium">Full Name *</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Stephen Jayjock"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#D4AF37]/50"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/70 text-xs uppercase tracking-wider font-medium">Email Address *</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@brokerage.com"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#D4AF37]/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-white/70 text-xs uppercase tracking-wider font-medium">Company / Brokerage</label>
                    <Input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Colliers International"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#D4AF37]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/70 text-xs uppercase tracking-wider font-medium">Subject</label>
                    <Input
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Team pricing inquiry"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#D4AF37]/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/70 text-xs uppercase tracking-wider font-medium">Message *</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help..."
                    rows={6}
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#D4AF37]/50 resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={notify.isPending}
                  className="w-full bg-[#D4AF37] hover:bg-[#C4A030] text-[#0A1628] font-bold py-3 text-sm tracking-wide"
                >
                  {notify.isPending ? (
                    <><Loader2 size={16} className="animate-spin mr-2" /> Sending...</>
                  ) : (
                    "Send Message"
                  )}
                </Button>

                <p className="text-white/30 text-xs text-center">
                  By submitting this form you agree to our{" "}
                  <Link href="/privacy"><span className="text-white/50 hover:text-white underline cursor-pointer">Privacy Policy</span></Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
