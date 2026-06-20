import React, { useState, useEffect } from "react";
import { Link, Clipboard, Scissors, ArrowRight, AlertCircle, Video, HelpCircle } from "lucide-react";

interface LinkAnalyzerProps {
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  resetResult: () => void;
}

export default function LinkAnalyzer({ onAnalyze, isLoading, error, clearError, resetResult }: LinkAnalyzerProps) {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<string>("none");

  // Determine platform logo in real-time to enforce TikTok strictly
  useEffect(() => {
    const lowerUrl = url.toLowerCase().trim();
    if (!lowerUrl) {
      setPlatform("none");
      return;
    }

    if (lowerUrl.includes("tiktok.com") || lowerUrl.includes("vt.tiktok")) {
      setPlatform("tiktok");
    } else if (
      lowerUrl.includes("youtube.com") || 
      lowerUrl.includes("youtu.be") || 
      lowerUrl.includes("instagram.com") || 
      lowerUrl.includes("twitter.com") || 
      lowerUrl.includes("x.com") || 
      lowerUrl.includes("facebook.com") || 
      lowerUrl.includes("fb.watch")
    ) {
      setPlatform("unsupported");
    } else {
      setPlatform("generic");
    }
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    // Direct TikTok strict check
    const lower = cleanUrl.toLowerCase();
    if (!lower.includes("tiktok.com") && !lower.includes("vt.tiktok")) {
      // Direct offline alert using parent context
      onAnalyze(""); // Trigger parent analytical wrapper reset or validation throw
      return;
    }

    clearError();
    onAnalyze(cleanUrl);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        clearError();
      }
    } catch (err) {
      console.warn("Clipboard read blocked inside secure iframe. Please paste manually using Ctrl+V.");
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case "tiktok":
        return (
          <div className="flex items-center gap-1.5 bg-teal-600/10 border border-teal-500/20 px-3 py-1 rounded-none text-teal-450 text-xs font-semibold animate-fade-in shadow-sm">
            <Video className="w-3.5 h-3.5 text-teal-400" />
            <span className="uppercase tracking-widest text-[9px] font-black text-teal-300 animate-pulse">Ready TikTok Video Link</span>
          </div>
        );
      case "unsupported":
        return (
          <div className="flex items-center gap-1.5 bg-rose-600/10 border border-rose-500/20 px-3 py-1 rounded-none text-rose-500 text-xs font-semibold animate-fade-in shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span className="uppercase tracking-widest text-[9px] font-black text-rose-405">TikTok Only (Other sites are disabled!)</span>
          </div>
        );
      case "generic":
        return (
          <div className="flex items-center gap-1.5 bg-amber-650/10 border border-amber-500/20 px-3 py-1 rounded-none text-amber-505 text-xs font-semibold animate-fade-in">
            <Link className="w-3.5 h-3.5 text-amber-500" />
            <span className="uppercase tracking-widest text-[9px] font-black text-amber-300">Unrecognized Video Link URL</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleClear = () => {
    setUrl("");
    clearError();
    resetResult();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="w-full relative">
        <div className="relative group">
          {/* Strict rigid white geometric border focus system */}
          <div className="relative bg-[#0F172A] border-2 border-slate-700 focus-within:border-teal-450 rounded-none flex items-center p-2.5 transition-all">
            <div className="pl-3 text-slate-400 flex-shrink-0">
              <Link className="w-5 h-5 group-focus-within:text-teal-400 transition-colors" />
            </div>
            
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste TikTok Video Link here (e.g. https://www.tiktok.com/@username/video/...)"
              disabled={isLoading}
              className="w-full bg-transparent border-0 ring-0 outline-0 py-2 sm:py-3 px-3 text-sm sm:text-base text-slate-100 placeholder-slate-500/40 font-mono focus:ring-0 focus:outline-none"
            />

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {url && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 px-3 rounded-none text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Clear
                </button>
              )}
              
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:flex items-center gap-1 px-3 py-3 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold uppercase tracking-wider border border-slate-600 transition-all active:translate-y-[1px] cursor-pointer"
                title="Paste from Clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
              
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className={`flex items-center gap-1.5 px-4 sm:px-8 py-3 rounded-none font-black text-xs sm:text-sm uppercase tracking-wider transition-all select-none cursor-pointer ${
                  isLoading || !url.trim()
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-705"
                    : "bg-teal-500 text-black hover:bg-teal-400 active:translate-y-[1px]"
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-none animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{isLoading ? "CONVERTING..." : "GET VIDEO"}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Floating platform helper banner & feedback block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[30px] px-2 font-mono">
        <div>
          {getPlatformIcon()}
        </div>
        <div className="text-[10px] uppercase font-black tracking-widest text-teal-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-teal-500" />
          <span>Save TikTok MP4 & pure MP3 instantly without watermark tags.</span>
        </div>
      </div>

      {/* Error card */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/40 rounded-none p-4 flex gap-3 text-rose-400 mt-2 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-rose-400">System Warning Notice</h4>
            <p className="text-xs text-rose-400/90 mt-1 leading-relaxed">
              {error}
            </p>
            <div className="mt-3 flex gap-4 text-[10px] font-black uppercase tracking-widest">
              <button onClick={handlePaste} className="hover:underline text-rose-300">Try Pasting Again</button>
              <span className="text-rose-900">|</span>
              <button 
                type="button"
                onClick={() => { setUrl("https://www.tiktok.com/@spacex/video/7374829103847291038"); clearError(); }} 
                className="hover:underline text-teal-300"
              >
                Load TikTok Sample Video Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
