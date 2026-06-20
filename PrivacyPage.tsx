import React from "react";
import { ShieldCheck, Lock, EyeOff, Scale, HelpCircle } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-6 sm:py-10">
      
      {/* Privacy Policy Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black uppercase tracking-tight text-white font-display italic">
          Privacy Policy & Terms
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Operational commitments regarding user data safety, cookie logs, secure CDN caching, and intellectual property limits. Read how we protect you.
        </p>
      </div>

      {/* Grid Policies Accordion/Panels */}
      <div className="space-y-6">
        
        {/* Policy Item 1 */}
        <div className="bg-[#131C2E] border border-slate-700 p-6 sm:p-8 space-y-3">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 font-mono">
            <Lock className="w-4 h-4 text-[#00f2fe]" />
            1. No User Data Gathering or Permanent Caching
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Our platform does not contain any login portals or credentials verification matrices. We never store personal details, IP addresses, video streams, or user history logs on our servers. Any video conversion requests are executed inside memory blocks that are discarded instantly once transmission to your browser completes.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Your personal dynamic download logs are stored 100% locally inside your browser's own metadata storage (<span className="text-teal-400 font-mono">localStorage</span>). You have absolute autonomy to clear this log whenever you like by clicking "Clear Logs" inside the dashboard.
          </p>
        </div>

        {/* Policy Item 2 */}
        <div className="bg-[#131C2E] border border-slate-700 p-6 sm:p-8 space-y-3">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 font-mono">
            <EyeOff className="w-4 h-4 text-[#00f2fe]" />
            2. High-Bound Cookie Caches & Web Analytics
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Our primary search indexing optimization systems utilize basic cookies to evaluate website loads, screen widths, and geolocation parameters purely to route server load. These statistics are completely anonymous and cannot be used to trace user identities.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            To prevent abuse, we monitor real-time download connection limits using rate-limit firewalls. This block ensures that server resources are equally distributed and prevents DDoS attacks.
          </p>
        </div>

        {/* Policy Item 3 */}
        <div className="bg-[#131C2E] border border-slate-700 p-6 sm:p-8 space-y-3">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 font-mono">
            <Scale className="w-4 h-4 text-[#00f2fe]" />
            3. Intellectual Property, Copyright Links, & Legal Fair Use
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            We highly respect original copyright ownership. This tool extracts direct video URLs that are already publicly visible on official TikTok servers. This service is designed to support personal backups, fair-use academic references, offline creator archives, or other non-commercial studies.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            We are not affiliated with, licensed by, or associated with TikTok, ByteDance Ltd., Snaptik, or other related organizations. Downloads must satisfy local copy protection guidelines, and users assume full responsibility for any redistribution of saved media formats.
          </p>
        </div>

        {/* Policy Item 4 */}
        <div className="bg-[#131C2E] border border-slate-700 p-6 sm:p-8 space-y-3">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-[#00f2fe]" />
            4. Real-Time Secure Sandbox Tunnels
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Our app operates sandboxed proxy relays to stream file layers safely. This maintains a barrier between you and external third-party tracker networks. We constantly enforce HTTPS encryption so that any data processed by the browser remains completely hidden from malicious network sniffers.
          </p>
        </div>

      </div>

    </div>
  );
}
