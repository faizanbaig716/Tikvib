import React from "react";
import { Video, HelpCircle, Shield, Zap, Sparkles, Image, Music } from "lucide-react";

export default function SupportedList() {
  const features = [
    {
      name: "Watermark-Free Video",
      icon: <Video className="w-5 h-5 text-teal-400" />,
      color: "border-teal-400/20 hover:border-teal-400/50 hover:bg-teal-400/5",
      desc: "Download MP4 videos cleanly. No annoying watermarks, text tags, or overlay logos.",
      tip: "Works flawlessly for vt.tiktok.com and standard URLs."
    },
    {
      name: "High-Bitrate MP3 Audio",
      icon: <Music className="w-5 h-5 text-blue-400" />,
      color: "border-blue-400/20 hover:border-blue-400/50 hover:bg-blue-400/5",
      desc: "Convert and save the background sound tracks or voiceovers from any TikTok post instantly.",
      tip: "Excellent for saving viral sounds and background audio."
    },
    {
      name: "Slideshow Image Dumps",
      icon: <Image className="w-5 h-5 text-purple-400" />,
      color: "border-purple-400/20 hover:border-purple-400/50 hover:bg-purple-400/5",
      desc: "Easily download full resolution individual photo slides from TikTok photo posts.",
      tip: "Separates slideshows into clear direct downloads."
    },
    {
      name: "High Resolution Options",
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      color: "border-amber-400/20 hover:border-amber-400/50 hover:bg-amber-400/5",
      desc: "Fetches up to 1080p source downloads based on original uploads without lossy compression.",
      tip: "Lossless bitrates are maintained for crisp visual clarity."
    }
  ];

  return (
    <div id="supported-platforms" className="w-full mt-12 bg-[#131C2E] border border-slate-700 rounded-none p-6 sm:p-8 font-mono">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            TikTok Downloader Features
          </h2>
          <p className="text-[11px] uppercase tracking-wide text-slate-400 mt-1 font-sans">
            Optimized exclusively for high-fidelity TikTok media downloads and watermark removal.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-[#0F172A] border border-teal-500/20 px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest text-[#00f2fe]">
          <span className="w-1.5 h-1.5 rounded-none bg-[#00f2fe] animate-pulse" />
          Dedicated TikTok Engine Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <div
            key={f.name}
            className="flex flex-col justify-between p-4 rounded-none border border-slate-800 bg-slate-950/30 transition-all duration-300 hover:border-slate-600 hover:bg-slate-950/60"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                {f.icon}
                <span className="font-extrabold text-xs uppercase tracking-wider text-white">{f.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{f.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-850 text-[9px] uppercase tracking-wider text-slate-500 italic font-mono">
              <strong>Tip:</strong> {f.tip}
            </div>
          </div>
        ))}
      </div>

      {/* Feature explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-800">
        <div className="flex gap-3">
          <div className="p-2.5 h-fit rounded-none bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest text-white">Watermark-Free Rendering</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
              Our backend scripts communicate with direct content servers to fetch standard native MP4 packets before TikTok overlays user watermark tracks.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="p-2.5 h-fit rounded-none bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest text-white">Unlimited Fast Proxies</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
              No daily limitations. Download as many videos as you like. Speed is throttled only by your local internet service bandwidth.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="p-2.5 h-fit rounded-none bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest text-white">Dual Mode Fallbacks</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
              If there is high demand, the app intelligently offers a direct browser save option so you can download files directly without any delay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
