"use client";

import { useState } from "react";
import { useDashboard } from "../DashboardContext";
import {
  Monitor, Cpu, Database, Settings, FileText, Box, Download, Clock, Layers,
  ShieldCheck, Shield, Terminal, ChevronDown, ExternalLink
} from "lucide-react";

function WindowsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" {...props}>
      <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM11.25 1.899L24 0v11.55H11.25V1.899zM11.25 12.45H24v11.55l-12.75-1.9v-9.65z" />
    </svg>
  );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" {...props}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-1.01 2.94.99.08 2.18-.52 2.84-1.33z" />
    </svg>
  );
}

function PenguinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" {...props}>
      <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.2.5 2.3 1.3 3C8 10.3 7 11.8 7 13.5v1.5c0 1.7 1.3 3 3 3h4c1.7 0 3-1.3 3-3v-1.5c0-1.7-1-3.2-1.8-4 .8-.7 1.3-1.8 1.3-3C16.5 4 14.5 2 12 2zm-1 3.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm3 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
    </svg>
  );
}

export default function DownloadsPage() {
  const { openWorkflow } = useDashboard();
  const [selectedCategory, setSelectedCategory] = useState("Software");
  const [downloadingStates, setDownloadingStates] = useState<Record<string, boolean>>({});

  const handleDownload = (id: string) => {
    setDownloadingStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setDownloadingStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const categories = [
    { label: "Software", count: 12, icon: Monitor },
    { label: "SDKs", count: 8, icon: Cpu },
    { label: "Drivers", count: 5, icon: Database },
    { label: "Tools", count: 6, icon: Settings },
    { label: "Documentation", count: 7, icon: FileText },
    { label: "Resources", count: 4, icon: Box }
  ];

  const featured = [
    {
      id: "node-software",
      title: "AEGIS Node Software",
      desc: "Core software for running and managing AEGIS compute nodes.",
      version: "v1.2.3",
      released: "May 12, 2025",
      platforms: ["linux", "windows", "macos"],
      buttonText: "Download for Linux"
    },
    {
      id: "sdk",
      title: "AEGIS SDK",
      desc: "SDK to build and integrate with the AEGIS network.",
      version: "v1.2.3",
      released: "May 08, 2025",
      platforms: ["linux", "windows", "macos"],
      buttonText: "Download SDK"
    },
    {
      id: "cli",
      title: "AEGIS CLI",
      desc: "Command line tools for node management and operations.",
      version: "v1.2.1",
      released: "May 05, 2025",
      platforms: ["linux", "windows", "macos"],
      buttonText: "Download for Linux"
    }
  ];

  const recentlyDownloaded = [
    { title: "AEGIS Node Software", version: "v1.2.3", date: "May 12, 2025", time: "10:24 AM", icon: ShieldCheck },
    { title: "AEGIS SDK", version: "v1.2.3", date: "May 08, 2025", time: "04:30 PM", icon: Cpu },
    { title: "AEGIS CLI", version: "v1.2.1", date: "May 05, 2025", time: "11:15 AM", icon: Terminal },
    { title: "AEGIS Documentation", version: "v1.2.3", date: "May 01, 2025", time: "09:40 AM", icon: FileText }
  ];

  return (
    <div className="flex flex-col gap-6 w-full text-slate-800">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Downloads", value: "156", sub: "All time", icon: Download, color: "text-[#4D7CFE] bg-blue-50 border border-blue-100" },
          { label: "This Month", value: "23", sub: "Downloads", icon: Clock, color: "text-emerald-600 bg-emerald-50 border border-emerald-100" },
          { label: "Resource Categories", value: "6", sub: "Software, SDKs, Tools & more", icon: Layers, color: "text-blue-500 bg-blue-50/50 border border-blue-100" },
          { label: "Verified Downloads", value: "100%", sub: "All files scanned and verified", icon: ShieldCheck, color: "text-[#4D7CFE] bg-blue-50 border border-blue-100" }
        ].map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${stat.color} flex items-center justify-center`}>
                <StatIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                <h4 className="text-xl font-extrabold text-slate-900 mt-1.5 leading-none">{stat.value}</h4>
                <p className="text-[9px] text-slate-400 font-semibold mt-1">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Download Center Categories */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Download Center</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 font-sans">Browse and download the latest AEGIS software and resources.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = selectedCategory === cat.label;
                return (
                  <button 
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-3 cursor-pointer ${
                      isSelected 
                        ? "border-[#4D7CFE] bg-blue-50/30 text-slate-900" 
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg w-fit ${isSelected ? "bg-white border border-blue-100 text-[#4D7CFE]" : "bg-slate-50 border border-slate-100 text-slate-400"}`}>
                      <CatIcon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-none">{cat.label}</div>
                      <div className="text-[9px] text-slate-400 font-bold mt-1.5 leading-none">{cat.count} items</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Downloads */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Featured Downloads</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Most popular and recommended downloads.</p>
              </div>
              <button className="text-[10px] font-extrabold text-[#4D7CFE] hover:underline uppercase tracking-wider">View all resources →</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((item) => {
                const isDownloading = downloadingStates[item.id];
                return (
                  <div key={item.id} className="border border-slate-200 p-5 rounded-2xl bg-white flex flex-col justify-between min-h-[260px] hover:border-slate-300 transition-colors">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-700">
                          {item.id === "node-software" ? <Shield className="h-5 w-5" /> : item.id === "sdk" ? <Terminal className="h-5 w-5" /> : <Terminal className="h-5 w-5" />}
                        </div>
                        <span className="bg-blue-50 border border-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">Latest</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-4 leading-none">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-2">{item.desc}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-700">
                        <span className="text-slate-400">Version</span>
                        <span className="font-bold">{item.version}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-700">
                        <span className="text-slate-400">Released</span>
                        <span className="font-bold">{item.released}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-700">
                        <span className="text-slate-400">Platform</span>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <PenguinIcon />
                          <WindowsIcon />
                          <AppleIcon />
                        </div>
                      </div>

                      <div className="flex mt-1">
                        <button 
                          onClick={() => handleDownload(item.id)}
                          className={`flex-1 text-center rounded-xl py-2.5 text-[10px] font-black cursor-pointer border ${
                            isDownloading 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                              : "bg-blue-50 hover:bg-blue-100/50 border-blue-100 text-[#4D7CFE]"
                          }`}
                        >
                          {isDownloading ? "Downloading..." : item.buttonText}
                        </button>
                        <button className="px-2.5 bg-slate-50 border-y border-r border-slate-200 rounded-r-xl hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Downloaded */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Recently Downloaded</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Your most recent downloads across all resources.</p>
              </div>
              <button className="text-[10px] font-extrabold text-[#4D7CFE] hover:underline uppercase tracking-wider">View all history →</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {recentlyDownloaded.map((item, i) => {
                const RecentIcon = item.icon;
                return (
                  <div key={i} className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl flex flex-col gap-2 relative">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400">
                        <RecentIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[10px] font-extrabold text-slate-900 truncate leading-none">{item.title}</h4>
                        <p className="text-[8px] font-mono text-slate-400 mt-1 leading-none">{item.version}</p>
                      </div>
                    </div>
                    <div className="text-[8px] text-slate-400 font-semibold mt-1">
                      {item.date} · {item.time}
                    </div>
                    <span className="absolute top-3 right-3 text-emerald-500 bg-emerald-50 w-4 h-4 rounded-full flex items-center justify-center text-[9px] border border-emerald-100 font-bold">✓</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          
          {/* System Compatibility */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">System Compatibility</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Ensure your system meets the requirements.</p>
            </div>

            <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 font-medium">OS</span>
                <span className="text-slate-900 font-bold text-right max-w-[160px] leading-relaxed">Ubuntu 20.04+ / Windows 10+ / macOS 11+</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                <span className="text-slate-400 font-medium">CPU</span>
                <span className="text-slate-900 font-bold">2+ Cores</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                <span className="text-slate-400 font-medium">RAM</span>
                <span className="text-slate-900 font-bold">4 GB+</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                <span className="text-slate-400 font-medium">Storage</span>
                <span className="text-slate-900 font-bold">10 GB+</span>
              </div>
              <div className="flex justify-between items-start border-t border-slate-50 pt-2">
                <span className="text-slate-400 font-medium">GPU</span>
                <span className="text-slate-900 font-bold text-right max-w-[160px] leading-relaxed">NVIDIA GPU (CUDA 11.0+) Recommended</span>
              </div>
            </div>

            <button className="text-[10px] font-extrabold text-[#4D7CFE] hover:underline uppercase tracking-wider text-left mt-2">View full requirements →</button>
          </div>

          {/* Need Help? */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Need Help?</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Access guides, documentation and support.</p>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              {[
                { title: "Installation Guide", href: "#" },
                { title: "API Documentation", href: "#" },
                { title: "Release Notes", href: "#" },
                { title: "Support Center", href: "#" }
              ].map((link, i) => (
                <a 
                  key={i}
                  href={link.href}
                  className="flex justify-between items-center py-2.5 text-slate-700 hover:text-[#4D7CFE] transition-colors border-b border-slate-50 font-bold"
                >
                  <span>{link.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Security & Verification */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Security & Verification</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">All downloads are scanned and verified.</p>
            </div>

            <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Verification</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" /> 100% Verified
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                <span className="text-slate-400 font-medium">Last Scan</span>
                <span className="text-slate-900 font-bold">May 12, 2025</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                <span className="text-slate-400 font-medium">Security Standard</span>
                <span className="text-slate-900 font-bold">AES-256 / SHA-256</span>
              </div>
            </div>

            <button className="text-[10px] font-extrabold text-[#4D7CFE] hover:underline uppercase tracking-wider text-left mt-2">Learn more about security →</button>
          </div>

        </div>

      </div>

    </div>
  );
}
