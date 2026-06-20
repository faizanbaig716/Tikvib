import React, { useState, useRef } from "react";
import { Download, FileVideo, Music, HardDrive, Info, Share2, Globe, Heart, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import { ParsedVideo, MediaFormat } from "../types";

interface FormatGridProps {
  video: ParsedVideo;
  onDownloadLogged: (formatLvlName: string) => void;
}

interface DownloadingState {
  formatId: string;
  progress: number;
  speed: string; // "3.2 MB/s", etc.
  totalSize: string; // "14 MB"
  downloadedBytes: string; // "4.5 MB"
  status: "idle" | "fetching" | "piping" | "assembling" | "completed" | "failed";
  error?: string;
}

export default function FormatGrid({ video, onDownloadLogged }: FormatGridProps) {
  const [downloading, setDownloading] = useState<DownloadingState>({
    formatId: "",
    progress: 0,
    speed: "0 KB/s",
    totalSize: "Auto",
    downloadedBytes: "0 MB",
    status: "idle"
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const openPreviewPlayer = (format: MediaFormat) => {
    onDownloadLogged(format.quality);
    const filename = video.title.replace(/[^a-zA-Z0-9.\-_ ()]/g, "_");
    const previewUrl = `/preview-player?url=${encodeURIComponent(format.url)}&title=${encodeURIComponent(video.title)}&platform=${encodeURIComponent(video.platform)}&filename=${encodeURIComponent(filename)}&extType=${encodeURIComponent(format.extType)}&quality=${encodeURIComponent(format.quality)}`;
    window.open(previewUrl, "_blank");
  };

  const handleNativeDownload = async (format: MediaFormat) => {
    onDownloadLogged(format.quality);
    
    try {
      let targetUrl = format.url;
      // Pre-resolve YouTube/Facebook direct video CDN stream address to bypass gateway limits
      if (video.platform === "youtube" || video.platform === "facebook") {
        const resolveRes = await fetch(`/api/resolve-media-url?url=${encodeURIComponent(format.url)}&platform=${encodeURIComponent(video.platform)}&quality=${encodeURIComponent(format.quality)}&extType=${format.extType}`);
        if (resolveRes.ok) {
          const resData = await resolveRes.json();
          if (resData.directUrl) {
            targetUrl = resData.directUrl;
          }
        }
      }

      const proxyUrl = `/api/download-stream?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(video.title)}&extType=${format.extType}`;
      
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = proxyUrl;
      downloadAnchor.setAttribute("download", `${video.title.replace(/[^a-zA-Z0-9.\-_ ()]/g, "_")}.${format.ext}`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    } catch (e) {
      console.warn("Native download pre-resolve speed-up failed, running fallback direct proxy:", e);
      const proxyUrl = `/api/download-stream?url=${encodeURIComponent(format.url)}&filename=${encodeURIComponent(video.title)}&extType=${format.extType}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = proxyUrl;
      downloadAnchor.setAttribute("download", `${video.title.replace(/[^a-zA-Z0-9.\-_ ()]/g, "_")}.${format.ext}`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    }
  };

  const handleInAppDownload = async (format: MediaFormat) => {
    if (downloading.status !== "idle" && downloading.status !== "completed" && downloading.status !== "failed") {
      // If already downloading, don't trigger again
      return;
    }

    onDownloadLogged(format.quality);

    setDownloading({
      formatId: format.id,
      progress: 0,
      speed: "0 MB/s",
      totalSize: format.size || "Calculating...",
      downloadedBytes: "0 MB",
      status: "fetching"
    });

    let targetUrl = format.url;

    try {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Stage: Resolve fast CDN streaming point to avoid download initiation delay / server timeouts
      if (video.platform === "youtube" || video.platform === "facebook") {
        const resolveRes = await fetch(`/api/resolve-media-url?url=${encodeURIComponent(format.url)}&platform=${encodeURIComponent(video.platform)}&quality=${encodeURIComponent(format.quality)}&extType=${format.extType}`, { signal });
        if (!resolveRes.ok) {
          throw new Error(`Cloud connection error during video extraction (Status ${resolveRes.status})`);
        }
        const resolveData = await resolveRes.json();
        if (resolveData.directUrl) {
          targetUrl = resolveData.directUrl;
        } else {
          throw new Error("Cloud resolver failed to fetch media nodes.");
        }
      }

      const proxyUrl = `/api/download-stream?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(video.title)}&extType=${format.extType}`;
      
      const startTime = Date.now();
      const response = await fetch(proxyUrl, { signal });

      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }

      const contentLengthHeader = response.headers.get("Content-Length");
      const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
      const formattedTotal = totalBytes 
        ? (totalBytes / (1024 * 1024)).toFixed(1) + " MB" 
        : format.size || "Unknown Size";

      setDownloading(prev => ({
        ...prev,
        status: "piping",
        totalSize: formattedTotal
      }));

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Could not initialize response stream reader.");
      }

      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;
      let lastUpdate = Date.now();
      let lastBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        chunks.push(value);
        receivedBytes += value.length;

        const now = Date.now();
        const durationSinceUpdate = (now - lastUpdate) / 1000;
        
        let currentSpeed = "";
        if (durationSinceUpdate >= 0.5) {
          const bytesSinceUpdate = receivedBytes - lastBytes;
          const bytesPerSecond = bytesSinceUpdate / durationSinceUpdate;
          if (bytesPerSecond >= 1024 * 1024) {
            currentSpeed = (bytesPerSecond / (1024 * 1024)).toFixed(1) + " MB/s";
          } else {
            currentSpeed = (bytesPerSecond / 1024).toFixed(0) + " KB/s";
          }
          lastUpdate = now;
          lastBytes = receivedBytes;
        }

        const calculatedProgress = totalBytes ? Math.min(100, Math.floor((receivedBytes / totalBytes) * 100)) : 50;
        const downloadedStr = (receivedBytes / (1024 * 1024)).toFixed(1) + " MB";

        setDownloading(prev => ({
          ...prev,
          progress: calculatedProgress,
          downloadedBytes: downloadedStr,
          speed: currentSpeed || prev.speed,
          status: "piping"
        }));
      }

      // Assemble File Blob
      setDownloading(prev => ({ ...prev, status: "assembling", progress: 99 }));
      
      const fileBlob = new Blob(chunks, { type: format.ext === "mp3" ? "audio/mpeg" : "video/mp4" });
      const blobUrl = URL.createObjectURL(fileBlob);
      
      // Prompt "Save As" trigger in Browser DOM
      const saveLink = document.createElement("a");
      saveLink.href = blobUrl;
      const finalFilename = `${video.title.replace(/[^a-zA-Z0-9.\-_ ()]/g, "_")}.${format.ext}`;
      saveLink.download = finalFilename;
      document.body.appendChild(saveLink);
      saveLink.click();
      document.body.removeChild(saveLink);
      
      // Cleanup Object URL safely
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      setDownloading(prev => ({
        ...prev,
        progress: 100,
        status: "completed"
      }));

    } catch (err: any) {
      if (err.name === "AbortError") {
        setDownloading({
          formatId: "",
          progress: 0,
          speed: "0 MB/s",
          totalSize: "Auto",
          downloadedBytes: "0 MB",
          status: "idle"
        });
      } else {
        console.warn("In-app downloader got CORS/Network block. Gracefully falling back to native player popup.", err);
        
        // Instantly trigger top-level native download redirection via proxyUrl
        const proxyUrl = `/api/download-stream?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(video.title)}&extType=${format.extType}`;
        try {
          const downloadAnchor = document.createElement("a");
          downloadAnchor.href = proxyUrl;
          downloadAnchor.setAttribute("download", `${video.title.replace(/[^a-zA-Z0-9.\-_ ()]/g, "_")}.${format.ext}`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          document.body.removeChild(downloadAnchor);
        } catch (anchorErr) {
          console.warn("Native anchor click failed. Opening in new tab instead.", anchorErr);
          window.open(targetUrl, "_blank");
        }

        setDownloading({
          formatId: format.id,
          progress: 100,
          speed: "Direct",
          totalSize: format.size || "Auto",
          downloadedBytes: "Redirected",
          status: "completed"
        });
      }
    }
  };

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="w-full bg-[#131C2E] border border-slate-700 rounded-none p-6 sm:p-8 mt-8 animate-fade-in shadow-xl">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Thumbnail Preview with Sharp Borders */}
        <div className="w-full lg:w-2/5 flex-shrink-0">
          <div className="relative aspect-video rounded-none overflow-hidden border border-slate-700 shadow-2xl group bg-black/40">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                Thumbnail Unreachable
              </div>
            )}
            
            {/* Play Button Indicator Decoration */}
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-60 group-hover:opacity-90 transition-opacity">
              <div className="w-12 h-12 rounded-none bg-slate-900/80 backdrop-blur-md border border-slate-700 flex items-center justify-center text-white scale-100 group-hover:scale-110 transition-transform">
                <FileVideo className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            {/* Platform Emblem Tag */}
            <span className="absolute top-4 left-4 bg-slate-950 border border-slate-700 px-3 py-1 rounded-none text-[10px] font-bold uppercase tracking-widest text-slate-200 shadow-lg font-mono">
              {video.platform}
            </span>

            {/* Demo indicator if fallback is used */}
            {video.isDemoFallback && (
              <div className="absolute bottom-4 left-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-none text-[9px] font-black tracking-widest uppercase text-center flex items-center justify-center gap-1 shadow-lg animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulated Sandbox Format Stream Enforced</span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug line-clamp-2 uppercase font-display">
              {video.title}
            </h3>
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Uploader: <span className="text-blue-400">{video.author}</span>
            </p>
            {video.extractionSource && (
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                Downloader: {video.extractionSource}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Format Selector Grid & Progress Gauge */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-750 pb-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              Available Formats
            </h3>
            <span className="text-[9px] font-mono uppercase font-black bg-emerald-500 text-black px-2 py-0.5">ACTIVE DOWNLOADER</span>
          </div>

          {/* Active Download State Overlay Container */}
          {downloading.status !== "idle" && (
            <div className="bg-[#0F172A] border border-slate-700 rounded-none p-5 space-y-4 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                    {downloading.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {downloading.status === "fetching" && (
                      video.platform === "youtube" || video.platform === "facebook"
                        ? "Converting format & prepping stream (takes 5-15s)..."
                        : "Establishing connection..."
                    )}
                    {downloading.status === "piping" && `Downloading segment data (${downloading.progress}%)`}
                    {downloading.status === "assembling" && "Structuring binary format packets..."}
                    {downloading.status === "completed" && "Download successfully finished!"}
                    {downloading.status === "failed" && "CDN stream timed out."}
                  </h4>
                  <p className="text-[10px] uppercase font-mono text-slate-500 mt-1">
                    Download connection is routing through secure converter tunnels.
                  </p>
                </div>
                {downloading.status !== "completed" && downloading.status !== "failed" && (
                  <button
                    onClick={handleCancelDownload}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-black uppercase tracking-widest transition"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-950 rounded-none h-2.5 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-350 rounded-none ${
                    downloading.status === "completed" 
                      ? "bg-emerald-500" 
                      : downloading.status === "failed" 
                        ? "bg-rose-500" 
                        : "bg-blue-500 animate-pulse"
                  }`}
                  style={{ width: `${downloading.progress}%` }}
                />
              </div>

              {/* Status parameters row */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-950/40 p-3 rounded-none border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Accumulated</span>
                  <span className="text-white font-extrabold">{downloading.downloadedBytes} / {downloading.totalSize}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Throughput</span>
                  <span className="text-blue-400 font-extrabold">{downloading.speed}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Stage</span>
                  <span className={`font-black uppercase text-[11px] ${
                    downloading.status === "completed" 
                      ? "text-emerald-400" 
                      : downloading.status === "failed" 
                        ? "text-rose-400" 
                        : "text-blue-400"
                  }`}>{downloading.status}</span>
                </div>
              </div>

              {downloading.status === "failed" && (
                <p className="text-[11px] text-rose-400 my-1 font-mono uppercase mt-2">
                  <strong>Notice:</strong> {downloading.error}
                </p>
              )}

              {downloading.status === "completed" && (
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-2">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDownloading({ formatId: "", progress: 0, speed: "", totalSize: "", downloadedBytes: "", status: "idle" })}
                      className="px-4 py-2 bg-emerald-500 text-black rounded-none text-xs font-black uppercase tracking-wider hover:bg-emerald-400 transition-all cursor-pointer"
                    >
                      Convert Another Format
                    </button>
                    {downloading.downloadedBytes === "Redirected" && (
                      <button
                        onClick={() => {
                          const activeFormat = video.formats.find(x => x.id === downloading.formatId);
                          if (activeFormat) {
                            const proxyUrl = `/api/download-stream?url=${encodeURIComponent(activeFormat.url)}&filename=${encodeURIComponent(video.title)}&extType=${activeFormat.extType}`;
                            const downloadAnchor = document.createElement("a");
                            downloadAnchor.href = proxyUrl;
                            downloadAnchor.setAttribute("download", `${video.title.replace(/[^a-zA-Z0-9.\-_ ()]/g, "_")}.${activeFormat.ext}`);
                            document.body.appendChild(downloadAnchor);
                            downloadAnchor.click();
                            document.body.removeChild(downloadAnchor);
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-none text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        title="Force direct native download link"
                      >
                        Force Download Again
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-400/90 font-mono uppercase tracking-widest leading-relaxed">
                    {downloading.downloadedBytes === "Redirected" 
                      ? "⚠️ IF DOWNLOAD DID NOT START AUTOMATICALLY, CLICK 'FORCE DOWNLOAD AGAIN'!"
                      : "File saved into browser's default downloads!"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Format Table or Interactive Stack */}
          <div className="space-y-3 font-mono">
            {video.formats.map((f) => {
              const isTypeAudio = f.type === "audio" || f.ext === "mp3";
              
              return (
                <div
                  key={f.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-none bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-none flex items-center justify-center flex-shrink-0 border ${
                      isTypeAudio 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                        : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    }`}>
                      {isTypeAudio ? <Music className="w-4 h-4" /> : <FileVideo className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm sm:text-base">{f.quality}</span>
                        <span className="px-2 py-0.5 rounded-none bg-slate-900 border border-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                          {f.ext}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                        Size: <span className="text-white font-bold">{f.size || "Auto"}</span> • Format: {f.type || "Video stream"}
                      </p>
                    </div>
                  </div>

                  {/* Convert / Download Options */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* In-App Direct Download Option */}
                    <button
                      onClick={() => handleInAppDownload(f)}
                      disabled={downloading.status !== "idle" && downloading.status !== "completed" && downloading.status !== "failed"}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-none text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        downloading.status !== "idle" && downloading.status !== "completed" && downloading.status !== "failed"
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 shadow-none"
                          : "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/10 active:scale-[0.98]"
                      }`}
                      title="Download with progress tracking directly on this page"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>GET DIRECT</span>
                    </button>

                    {/* Native Direct Save Option */}
                    <button
                      onClick={() => handleNativeDownload(f)}
                      className="px-3.5 py-2.5 rounded-none bg-transparent hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Direct browser native save link"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span className="xs:inline">Browser Save</span>
                    </button>

                    {/* Cinematic Live Preview (Google Drive Mode) Option */}
                    {(video.platform === "youtube" || video.platform === "facebook") && (
                      <button
                        onClick={() => openPreviewPlayer(f)}
                        className="px-3 py-2.5 rounded-none bg-[#1E1B4B]/60 text-indigo-300 hover:text-white border border-indigo-900/45 hover:border-indigo-700 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                        title="Watch in Google Drive player preview"
                      >
                        <svg className="w-3.5 h-3.5 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Cinematic Play</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice Tip */}
          <div className="flex items-start gap-2.5 bg-slate-950/20 border border-slate-800 rounded-none p-4 text-[10px] text-slate-450 uppercase tracking-wider leading-relaxed font-mono mt-4">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Status Warning:</strong> If connection layers limit the in-app tracker on your network, use <strong>Browser Save</strong> for direct browser download.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
