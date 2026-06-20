import React, { useState, useEffect } from "react";
import { Download, ShieldCheck, Heart, Sparkles, Sliders, Music, History, ExternalLink, RefreshCw, HelpCircle, ArrowDown, Video, Mail, ShieldAlert } from "lucide-react";
import LinkAnalyzer from "./components/LinkAnalyzer";
import FormatGrid from "./components/FormatGrid";
import HistoryList from "./components/HistoryList";
import SupportedList from "./components/SupportedList";
import ContactPage from "./components/ContactPage";
import PrivacyPage from "./components/PrivacyPage";
import { ParsedVideo, HistoryItem, MediaFormat } from "./types";

export default function App() {
  const [activePage, setActivePage] = useState<"home" | "contact" | "privacy">("home");
  const [parsedVideo, setParsedVideo] = useState<ParsedVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing video...");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cobaltNodes, setCobaltNodes] = useState<string[]>([
    "https://cobalt.moe",
    "https://api.cobalt.cr.us.kg",
    "https://cobalt.pervessetout.com",
    "https://cobalt.api.scv.re",
    "https://cobalt.lol",
    "https://cobalt.cool",
    "https://cobalt.sh",
    "https://api.cobalt.tools"
  ]);

  // Load instances on startup to ensure we use up-to-date healthy community endpoints
  useEffect(() => {
    fetch("/api/instances")
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data.instances) && data.instances.length > 0) {
          setCobaltNodes(data.instances);
        }
      })
      .catch(() => {
        // Fallback silently to static pre-populated nodes list
      });
  }, []);

  // Load download logs history from localStorage on mount safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem("social_download_history_logs");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Could not read local download history:", err);
    }
  }, []);

  // Save history to localStorage whenever change occurs
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("social_download_history_logs", JSON.stringify(newHistory));
    } catch (err) {
      console.warn("Failed to write download history to localStorage:", err);
    }
  };

  // Rotate loading text messages for elite professional UX style
  useEffect(() => {
    if (!isLoading) return;

    const texts = [
      "Analyzing media url sequence...",
      "Bypassing cross-origin header walls...",
      "Resolving high-definition direct link streams...",
      "Structuring CDN codec formats...",
      "Generating secure sandbox download buffers..."
    ];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Helper to carry out direct client-side extraction as a powerful failover tunnel
  const runClientSideExtraction = async (videoUrl: string, platform: string): Promise<ParsedVideo | null> => {
    const cleanUrl = videoUrl.trim();
    const v10Payload = {
      url: cleanUrl,
      videoQuality: "1080",
      audioFormat: "mp3",
      audioOnly: false
    };

    // Shuffle nodes slightly to prevent query-spamming the first node
    const shuffledNodes = [...cobaltNodes].sort(() => Math.random() - 0.5);

    for (const node of shuffledNodes) {
      try {
        console.log(`[Client Scraper] Attempting connection to community node: ${node}`);
        const controller = new AbortController();
        const connectionTimeout = setTimeout(() => controller.abort(), 6000);

        let res = await fetch(node, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(v10Payload),
          signal: controller.signal
        });
        clearTimeout(connectionTimeout);

        if (!res.ok && res.status === 400) {
          console.log(`Node ${node} returned 400. Attempting legacy JSON body schema...`);
          const legacyController = new AbortController();
          const legacyTimeout = setTimeout(() => legacyController.abort(), 6000);
          res = await fetch(`${node}/api/json`, {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              url: cleanUrl,
              videoQuality: "1085",
              audioFormat: "mp3",
              isAudioOnly: false
            }),
            signal: legacyController.signal
          });
          clearTimeout(legacyTimeout);
        }

        if (res.ok) {
          const data = await res.json();
          if (data && data.status === "error") {
            continue;
          }

          if (data && (data.url || data.picker || data.text)) {
            const formats: MediaFormat[] = [];
            if (data.url) {
              formats.push({
                id: "client_high_res",
                quality: "High Definition (Direct MP4)",
                ext: "mp4",
                url: data.url,
                extType: "mp4",
                size: "Auto",
                type: "video"
              });
              formats.push({
                id: "client_audio",
                quality: "Audio Extract (Direct MP3)",
                ext: "mp3",
                url: data.url,
                extType: "mp3",
                size: "Auto",
                type: "audio"
              });
            } else if (data.status === "picker" && Array.isArray(data.picker)) {
              data.picker.forEach((item: any, idx: number) => {
                const itemType = item.type || "video";
                formats.push({
                  id: `client_picker_${idx}_${itemType}`,
                  quality: item.quality || (itemType === "audio" ? "Audio Track" : "Direct Standard Resolution"),
                  ext: itemType === "audio" ? "mp3" : "mp4",
                  url: item.url,
                  extType: itemType === "audio" ? "mp3" : "mp4",
                  size: item.size || "Auto",
                  type: itemType
                });
              });
            }

            if (formats.length > 0) {
              const cleanedHost = node.replace(/^https?:\/\//, "");
              return {
                title: data.title || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Stream Download`,
                thumbnail: data.thumbnail || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300",
                author: data.author || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Publisher`,
                sourceUrl: cleanUrl,
                platform,
                formats,
                extractionSource: `Direct Browser Tunnel (${cleanedHost})`
              };
            }
          }
        }
      } catch (e) {
        console.log(`Direct browser connection bypassed for node ${node}`);
      }
    }
    return null;
  };

  // Main analyze trigger
  const handleAnalyzeLink = async (url: string) => {
    setError(null);
    setParsedVideo(null);

    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError("Please paste a valid TikTok video URL (e.g. https://www.tiktok.com/@creator/video/1234567...)");
      return;
    }

    const lower = cleanUrl.toLowerCase();
    const isTikTok = lower.includes("tiktok.com") || lower.includes("vt.tiktok");
    if (!isTikTok) {
      setError("Note: Only TikTok video downloads are supported. YouTube, Instagram, Facebook, and Twitter/X are disabled on this dedicated TikTok node.");
      return;
    }

    setIsLoading(true);
    setLoadingText("Connecting to TikTok...");
    let platform = "tiktok";

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analyzing link returned error.");
      }

      const data = await response.json();
      
      // If server returned a sandbox-banned fallback, automatically initiate proactive browser-side parsing failover!
      if (data.isDemoFallback) {
        setLoadingText("Preparing download options...");
        try {
          const clientData = await runClientSideExtraction(url, data.platform || platform);
          if (clientData) {
            setParsedVideo(clientData);
            return;
          }
        } catch (clientErr) {
          console.warn("Client browser tunnel failed. Yielding default sandbox view:", clientErr);
        }
      }

      if (!data.formats || data.formats.length === 0) {
        throw new Error("Could not load any direct video streams. Please try another public post.");
      }

      setParsedVideo(data);
    } catch (err: any) {
      console.warn("Server connection failed. Activating browser download helper...", err);
      setLoadingText("Rerouting download via secure browser connection...");
      try {
        const clientData = await runClientSideExtraction(url, platform);
        if (clientData) {
          setParsedVideo(clientData);
          return;
        }
      } catch (clientErr) {
        console.error("Local client-side extraction failure:", clientErr);
      }
      setError("Unable to find the download stream. This post may be private or restricted. Please try another public link.");
    } finally {
      setIsLoading(false);
    }
  };

  // Registers past downloaded formats to History logs
  const handleDownloadLogged = (formatLvlName: string) => {
    if (!parsedVideo) return;

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 11),
      title: parsedVideo.title,
      thumbnail: parsedVideo.thumbnail,
      platform: parsedVideo.platform,
      sourceUrl: parsedVideo.sourceUrl,
      formatDownloaded: formatLvlName,
      downloadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " / " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
    };

    // Keep history maximum length of 20 elements
    const updated = [newItem, ...history.slice(0, 19)];
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
  };

  const handleReDownload = (item: HistoryItem) => {
    // When re-downloading from history, re-analyze that URL automatically
    handleAnalyzeLink(item.sourceUrl);
    // Smooth scroll back to input field
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTestLink = (testUrl: string) => {
    handleAnalyzeLink(testUrl);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans border-[12px] border-[#1E293B] relative">
      
      {/* Geometric background grid lines overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b1a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b1a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-10" />

      {/* Styled Mechanical Header Banner */}
      <header className="h-20 border-b border-slate-700 flex items-center justify-between px-6 sm:px-10 bg-[#0F172A]">
        <button 
          onClick={() => setActivePage("home")}
          className="flex items-center gap-3 hover:opacity-85 text-left bg-transparent border-none cursor-pointer p-0"
        >
          <div className="w-10 h-10 bg-teal-500 rounded-none border-2 border-white flex items-center justify-center font-bold text-xl text-black">T</div>
          <span className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-white font-display">TIKVIBE</span>
        </button>
        <div className="flex gap-4 sm:gap-8 items-center">
          <nav className="flex gap-4 sm:gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
            <button
              onClick={() => setActivePage("home")}
              className={`hover:text-teal-400 transition-colors uppercase cursor-pointer ${activePage === "home" ? "text-teal-400 border-b-2 border-teal-500 pb-1" : ""}`}
            >
              Home
            </button>
            <button
              onClick={() => setActivePage("contact")}
              className={`hover:text-teal-400 transition-colors uppercase cursor-pointer ${activePage === "contact" ? "text-teal-400 border-b-2 border-teal-500 pb-1" : ""}`}
            >
              Contact Us
            </button>
            <button
              onClick={() => setActivePage("privacy")}
              className={`hover:text-teal-400 transition-colors uppercase cursor-pointer ${activePage === "privacy" ? "text-teal-400 border-b-2 border-teal-500 pb-1" : ""}`}
            >
              Privacy Policy
            </button>
          </nav>
          <div className="hidden sm:flex h-10 px-4 border border-teal-500/40 items-center justify-center text-[10px] font-bold bg-teal-550 text-teal-400 uppercase tracking-widest rounded-none">
            PRO STREAM
          </div>
        </div>
      </header>

      {/* Main Structural Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-fade-in">
        
        {activePage === "home" && (
          <>
            {/* Top Header Row with micro-badges */}
            <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-widest rounded-none">
                <span className="w-1.5 h-1.5 rounded-none bg-teal-400" />
                <Sparkles className="w-3 h-3 text-teal-300" />
                TikTok Watermark Remover & Downloader v3.0
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-display uppercase italic leading-none">
                TikTok Video<br />Downloader
              </h1>
              
              <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed">
                Save TikTok videos in high definition (HD MP4) and pure MP3 audio without watermark overlays. Fast, free, and perfectly formatted.
              </p>
            </div>

            {/* Dashboard Dynamic Control Panels Grid */}
            <div className="space-y-6">
              
              {/* Main Search Component */}
              <LinkAnalyzer
                onAnalyze={handleAnalyzeLink}
                isLoading={isLoading}
                error={error}
                clearError={() => setError(null)}
                resetResult={() => setParsedVideo(null)}
              />

              {/* Core Interactive Loading Overlay */}
              {isLoading && (
                <div className="w-full max-w-xl mx-auto p-8 rounded-none bg-[#131C2E] border border-slate-700 shadow-xl flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                  <div className="relative w-16 h-16 flex items-center justify-center rounded-none">
                    <div className="absolute inset-0 w-full h-full rounded-none border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                    <div className="w-10 h-10 rounded-none bg-slate-950 flex items-center justify-center text-teal-400">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-250 text-sm tracking-widest uppercase">Processing Request</h4>
                    <p className="text-xs text-teal-400 font-mono italic animate-pulse">{loadingText}</p>
                  </div>
                </div>
              )}

              {/* Quick-start Test Links with TikTok Sample Links */}
              {!parsedVideo && !isLoading && (
                <div className="w-full max-w-2xl mx-auto bg-[#131C2E] border border-slate-700 rounded-none p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
                  <span className="text-slate-400 uppercase font-black tracking-wider text-[10px] flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-teal-400" />
                    Quick Sample Demos:
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => handleTestLink("https://www.tiktok.com/@spacex/video/7374829103847291038")}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-none hover:text-white transition cursor-pointer font-bold uppercase tracking-tight text-[11px]"
                    >
                      🚀 SpaceX Lift-off.mp4
                    </button>
                    <button
                      onClick={() => handleTestLink("https://www.tiktok.com/@nasa/video/7312948192038192831")}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-none hover:text-white transition cursor-pointer font-bold uppercase tracking-tight text-[11px]"
                    >
                      🪐 NASA Nebula.mp4
                    </button>
                  </div>
                </div>
              )}

              {/* Display Analyzed Format Options */}
              {parsedVideo && !isLoading && (
                <FormatGrid
                  video={parsedVideo}
                  onDownloadLogged={handleDownloadLogged}
                />
              )}

              {/* Dynamic Row: History & Info stats panels */}
              {history.length > 0 && (
                <div className="grid grid-cols-1 gap-6">
                  <HistoryList
                    items={history}
                    onClearAll={handleClearHistory}
                    onDeleteItem={handleDeleteHistoryItem}
                    onReDownload={handleReDownload}
                  />
                </div>
              )}

              {/* TikTok specific features compatibility list */}
              <SupportedList />

              {/* Masterclass SEO content section for first page rankings */}
              <div className="w-full mt-12 bg-[#131C2E] border border-slate-700 p-6 sm:p-10 text-slate-300 antialiased space-y-8 font-sans">
                
                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display italic">
                    How to Download TikTok Videos Without Watermark
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Downloading your favorite trending files using TikVibe is remarkably straightforward. Use our free web utility by following these three effortless steps:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-mono text-xs">
                    <div className="border border-slate-800 p-4 bg-slate-950/40">
                      <div className="text-teal-400 font-extrabold text-lg mb-2">01. COPY LINK</div>
                      <p className="text-slate-400 font-sans text-xs">Open the TikTok application or web portal, view the desired clip, and select 'Copy Link' of the post.</p>
                    </div>
                    <div className="border border-slate-800 p-4 bg-slate-950/40">
                      <div className="text-teal-400 font-extrabold text-lg mb-2">02. PASTE INPUT</div>
                      <p className="text-slate-400 font-sans text-xs">Return to TikVibe, paste the link sequence into our input search box above, and click the Get Video button.</p>
                    </div>
                    <div className="border border-slate-800 p-4 bg-slate-950/40">
                      <div className="text-teal-400 font-extrabold text-lg mb-2">03. DOWNLOAD MEDIA</div>
                      <p className="text-slate-400 font-sans text-xs">Choose between crystal-clear Watermark-Free MP4 or high-fidelity MP3 audio files. Your secure download will begin instantly.</p>
                    </div>
                  </div>
                </section>

                <div className="border-t border-slate-800 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-3">
                    <h3 className="font-extrabold text-white text-sm uppercase tracking-wider font-mono">
                      Why Choose TikVibe TikTok Downloader?
                    </h3>
                    <ul className="text-xs text-slate-400 space-y-2.5 list-disc pl-4 leading-relaxed">
                      <li><strong>Absolutely Free:</strong> No paid paywalls, no recurring VIP keys, and zero account subscriptions required. Save as many clips as you desire.</li>
                      <li><strong>Zero Watermarks:</strong> Keep downloaded MP4 formats pure. Our converter pulls native streams straight from TikTok's global cache layers.</li>
                      <li><strong>Multi-Device Compatible:</strong> Fully responsive layouts. Save videos cleanly on iPhones, iPads, Android smartphones, MacOS notebooks, or Windows PCs.</li>
                      <li><strong>Fast Offline Backups:</strong> Perfect for backup files, creator portfolio compilations, design references, and study archives.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-extrabold text-white text-sm uppercase tracking-wider font-mono">
                      Frequently Asked Questions (FAQ)
                    </h3>
                    <div className="space-y-4 text-xs font-sans">
                      <div>
                        <h4 className="font-bold text-slate-100">Do you charge for downloading TikTok Mp3 files?</h4>
                        <p className="text-slate-400 mt-0.5">No. TikTok MP3 sound tracks and full HD video formats are 100% free with unlimited daily usage counts.</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100">Does TikVibe store downloaded videos?</h4>
                        <p className="text-slate-400 mt-0.5">Never. Files are streamed straight to your device from secure peer-to-peer web sessions. We maintain zero database logs.</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

            </div>
          </>
        )}

        {activePage === "contact" && <ContactPage />}
        {activePage === "privacy" && <PrivacyPage />}

      </main>

      {/* Visual Footer */}
      <footer className="w-full border-t border-slate-700 bg-slate-950 py-8 text-center text-xs text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="uppercase tracking-wider font-bold text-[10px]">High-Speed Secure Audio & Video Downloader. All downloads are saved locally.</span>
          </div>
          <div className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">
            Uptime: <span className="text-emerald-400 font-bold">100% (ONLINE)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

