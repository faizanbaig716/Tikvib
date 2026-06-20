import React from "react";
import { History, Trash2, Download, ExternalLink, Calendar, Video, Chrome, Music } from "lucide-react";
import { HistoryItem } from "../types";

interface HistoryListProps {
  items: HistoryItem[];
  onClearAll: () => void;
  onDeleteItem: (id: string) => void;
  onReDownload: (item: HistoryItem) => void;
}

export default function HistoryList({ items, onClearAll, onDeleteItem, onReDownload }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="w-full mt-6 bg-[#131C2E] border border-slate-700 rounded-none p-8 text-center shadow-lg">
        <div className="mx-auto w-12 h-12 rounded-none bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <History className="w-5 h-5 animate-pulse" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">No Download Archives</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed font-sans">
          The files you download will be stored securely inside your browser's local memory for instant access.
        </p>
      </div>
    );
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "youtube":
        return <span className="bg-red-500/10 text-red-450 border border-red-500/20 px-2 py-0.5 rounded-none text-[9px] font-black tracking-widest uppercase">YouTube</span>;
      case "instagram":
        return <span className="bg-pink-500/10 text-pink-450 border border-pink-500/20 px-2 py-0.5 rounded-none text-[9px] font-black tracking-widest uppercase">Instagram</span>;
      case "tiktok":
        return <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-none text-[9px] font-black tracking-widest uppercase">TikTok</span>;
      case "twitter":
        return <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-none text-[9px] font-black tracking-widest uppercase">Twitter / X</span>;
      case "facebook":
        return <span className="bg-blue-500/10 text-blue-450 border border-blue-500/20 px-2 py-0.5 rounded-none text-[9px] font-black tracking-widest uppercase">Facebook</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-none text-[9px] font-black tracking-widest uppercase">Format</span>;
    }
  };

  return (
    <div id="download-history" className="w-full mt-6 bg-[#131C2E] border border-slate-700 rounded-none p-5 sm:p-6 shadow-xl transition-all font-mono">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">Active Downloads ({items.length})</h2>
        </div>
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-350 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Log
        </button>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all duration-300 group rounded-none"
          >
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              {/* Thumbnail preview thumbnail */}
              <div className="relative w-14 h-14 rounded-none overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <Video className="w-5 h-5" />
                  </div>
                )}
                {/* Platform overlay token */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
              </div>
              
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors tracking-tight uppercase">
                  {item.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {getPlatformIcon(item.platform)}
                  <span className="text-[9px] text-blue-300 bg-blue-500/5 px-2 py-0.5 rounded-none border border-blue-500/10 flex items-center gap-1 font-mono uppercase tracking-widest font-black">
                    {item.formatDownloaded === "Audio" ? <Music className="w-2.5 h-2.5 text-blue-400" /> : <Video className="w-2.5 h-2.5 text-blue-400" />}
                    {item.formatDownloaded}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {item.downloadedAt}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions panel */}
            <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center border-t border-slate-900 sm:border-0 pt-3 sm:pt-0">
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial p-2 rounded-none bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1 text-[10px] uppercase font-black tracking-widest"
                title="View Original Post"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="sm:hidden">Original Post</span>
              </a>
              <button
                onClick={() => onReDownload(item)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-none bg-blue-500 hover:bg-blue-400 text-white font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                title="Download Again"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD AGAIN</span>
              </button>
              <button
                onClick={() => onDeleteItem(item.id)}
                className="p-2 rounded-none bg-slate-900 border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/5 text-slate-500 hover:text-rose-450 transition-all flex items-center justify-center"
                title="Remove from history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
