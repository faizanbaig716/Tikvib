import React, { useState } from "react";
import { Send, CheckCircle, Mail, MapPin, Sparkles, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "TikTok Support Needed", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setFormData({ name: "", email: "", subject: "TikTok Support Needed", message: "" });
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in py-6 sm:py-10">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black uppercase tracking-tight text-white font-display italic">
          Contact Support & Feedback
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Need help or having trouble with specific video links? Get in touch with our support team to help with any TikTok video save issues.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Contact info grid section */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#131C2E] border border-slate-700 p-6 space-y-6 font-mono">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#00f2fe] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              System Status
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-200 uppercase tracking-wider">Email Communication</h4>
                  <p className="text-slate-404 mt-1 font-sans">support@tikvibe-downloader.local</p>
                </div>
              </div>

              <div className="flex gap-3">
                <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-200 uppercase tracking-wider">Developer & Creator Options</h4>
                  <p className="text-slate-404 mt-1 font-sans">Available for custom workflows</p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-200 uppercase tracking-wider">Cloud Operations</h4>
                  <p className="text-slate-404 mt-1 font-sans">Distributed across Global IP Networks</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
              Response time within <span className="text-teal-400 font-bold">12 Hours</span>
            </div>
          </div>

          <div className="bg-[#131C2E]/50 border border-slate-800 p-6 rounded-none text-xs text-slate-400 leading-relaxed space-y-3 font-sans">
            <h4 className="font-black text-white uppercase tracking-widest font-mono text-[11px]">How can we optimize your workflow?</h4>
            <p>
              We prioritize video streaming optimizations. If a specific creator account outputs encrypted playlist signatures, send us the URL. We continuously release node-level bypass updates.
            </p>
          </div>
        </div>

        {/* Contact Form card */}
        <div className="md:col-span-7 bg-[#131C2E] border border-slate-700 p-6 sm:p-8 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white border-b border-slate-800 pb-4 font-mono">
            Direct Transmission Form
          </h2>

          {sent ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 text-center space-y-4 animate-fade-in font-mono">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-none border border-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-emerald-400 text-sm uppercase tracking-wider">Message Dispatched!</h4>
                <p className="text-[11px] text-slate-300 font-sans">
                  Our team will look into your request and get back to you soon.
                </p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="mt-2 px-4 py-2 bg-emerald-500 text-black font-black uppercase text-xs tracking-wider hover:bg-emerald-450 transition-colors cursor-pointer"
              >
                Send New Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Creator Brand"
                    className="w-full bg-[#0F172A] border border-slate-700 focus:border-teal-400 p-3 outline-none text-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. business@domain.com"
                    className="w-full bg-[#0F172A] border border-slate-700 focus:border-teal-400 p-3 outline-none text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Inquiry Category</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#0F172A] border border-slate-700 focus:border-teal-400 p-3 outline-none text-slate-200 text-xs"
                >
                  <option value="TikTok Support Needed">Failed TikTok Video Link Url</option>
                  <option value="Slideshow Parse Error">Photo Slideshow Downloading Issue</option>
                  <option value="Bulk API Licensing">Bulk Download Integration Help</option>
                  <option value="General Feedback">Feature Recommendation / UX Feedback</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Inquiry Body Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Paste details of the TikTok URL, device type, or any downloading errors here..."
                  className="w-full bg-[#0F172A] border border-slate-700 focus:border-teal-400 p-3 outline-none text-slate-200 text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-black font-extrabold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-none animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{loading ? "TRANSMITTING..." : "SUBMIT FEEDBACK"}</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
