"use client";

import { useState } from "react";
import { useDashboard } from "../DashboardContext";
import {
  Layers, Cpu, Database, Download, CreditCard, ExternalLink, RotateCcw, Shield, Activity
} from "lucide-react";

export default function UsagePage() {
  const [selectedRange, setSelectedRange] = useState("Last 30 Days");
  const [selectedInterval, setSelectedInterval] = useState("Daily");

  const metrics = [
    { label: "Total Consumption", value: "12,540", unit: "Core Hours", sub: "18.4% vs last month", icon: Layers, color: "text-[#4D7CFE] bg-blue-50 border border-blue-100", trendUp: true },
    { label: "Total GPU Hours", value: "3,920", unit: "GPU Hours", sub: "12.7% vs last month", icon: Cpu, color: "text-purple-600 bg-purple-50 border border-purple-100", trendUp: true },
    { label: "Total Storage", value: "48.6", unit: "TB", sub: "9.3% vs last month", icon: Database, color: "text-emerald-600 bg-emerald-50 border border-emerald-100", trendUp: true },
    { label: "Data Transfer", value: "2.14", unit: "TB", sub: "-4.2% vs last month", icon: Download, color: "text-red-500 bg-red-50 border border-red-100", trendUp: false },
    { label: "Est. Cost", value: "$2,842.60", unit: "", sub: "14.8% vs last month", icon: CreditCard, color: "text-[#4D7CFE] bg-blue-50 border border-blue-100", trendUp: true }
  ];

  const resources = [
    { name: "Core Hours", consumed: "12,540 Core Hrs", limit: "20,000 Core Hrs", util: "62.7%", progress: 62.7, color: "bg-[#4D7CFE]", trend: "18.4%", trendUp: true, icon: Layers },
    { name: "GPU Hours", consumed: "3,920 GPU Hrs", limit: "8,000 GPU Hrs", util: "49.0%", progress: 49.0, color: "bg-purple-500", trend: "12.7%", trendUp: true, icon: Cpu },
    { name: "Storage", consumed: "48.6 TB", limit: "100 TB", util: "48.6%", progress: 48.6, color: "bg-emerald-500", trend: "9.3%", trendUp: true, icon: Database },
    { name: "Data Transfer", consumed: "2.14 TB", limit: "5 TB", util: "42.8%", progress: 42.8, color: "bg-orange-500", trend: "-4.2%", trendUp: false, icon: Download }
  ];

  const usageByNode = [
    { node: "AEGIS-NODE-04", cores: "2,340", gpus: "820", storage: "12.4" },
    { node: "AEGIS-NODE-02", cores: "1,890", gpus: "640", storage: "9.8" },
    { node: "AEGIS-NODE-01", cores: "1,420", gpus: "520", storage: "7.6" },
    { node: "AEGIS-NODE-03", cores: "1,130", gpus: "410", storage: "6.1" },
    { node: "AEGIS-NODE-05", cores: "640", gpus: "230", storage: "4.3" }
  ];

  const usageByProject = [
    { project: "AI-Training", cores: "4,620", gpus: "1,820", cost: "$1,245.30" },
    { project: "Research-Models", cores: "3,180", gpus: "980", cost: "$783.11" },
    { project: "Data-Pipeline", cores: "2,140", gpus: "620", cost: "$512.82" },
    { project: "Inference-API", cores: "1,420", gpus: "300", cost: "$301.20" },
    { project: "Dev-Environment", cores: "1,180", gpus: "200", cost: "$198.17" }
  ];

  return (
    <div className="flex flex-col gap-6 w-full text-slate-800">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {metrics.map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${stat.color} flex items-center justify-center`}>
                <StatIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                <h4 className="text-lg font-extrabold text-slate-900 mt-2 leading-none">
                  {stat.value} <span className="text-[10px] font-semibold text-slate-400">{stat.unit}</span>
                </h4>
                <p className={`text-[9px] font-bold mt-1.5 flex items-center gap-0.5 ${stat.trendUp ? "text-emerald-600" : "text-red-500"}`}>
                  {stat.trendUp ? "↗" : "↘"} {stat.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Usage Overview Graph & Resource Type table) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Usage Overview Chart Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4 relative">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Usage Overview</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Aggregated resource utilization trends over active data ranges.</p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={selectedRange} 
                  onChange={e => setSelectedRange(e.target.value)}
                  className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>Last 12 Months</option>
                </select>
                <select 
                  value={selectedInterval} 
                  onChange={e => setSelectedInterval(e.target.value)}
                  className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>

            {/* Legend indicators */}
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4D7CFE]" /> Core Hours
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> GPU Hours
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Storage (TB)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Data Transfer (TB)
              </div>
            </div>

            {/* SVG Line Graph */}
            <div className="relative mt-2 h-[260px] w-full">
              <svg className="w-full h-full" viewBox="0 0 1000 240" preserveAspectRatio="none">
                {/* Dashed grid lines */}
                <line x1="0" y1="40" x2="1000" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="90" x2="1000" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="140" x2="1000" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="190" x2="1000" y2="190" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />

                {/* Core Hours - Blue */}
                <path 
                  d="M 50 160 Q 150 110 250 140 T 450 100 T 650 120 T 850 80 T 950 100" 
                  fill="none" 
                  stroke="#4D7CFE" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />
                
                {/* GPU Hours - Purple */}
                <path 
                  d="M 50 195 Q 150 170 250 180 T 450 150 T 650 165 T 850 140 T 950 155" 
                  fill="none" 
                  stroke="#A855F7" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />

                {/* Storage - Green */}
                <path 
                  d="M 50 215 Q 150 210 250 212 T 450 205 T 650 210 T 850 200 T 950 205" 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />

                {/* Data Transfer - Orange */}
                <path 
                  d="M 50 228 Q 150 227 250 226 T 450 225 T 650 226 T 850 224 T 950 225" 
                  fill="none" 
                  stroke="#F97316" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />

                {/* Vertical tooltip tracker line */}
                <line x1="880" y1="10" x2="880" y2="230" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />

                {/* Tooltip dot pins */}
                <circle cx="880" cy="85" r="4.5" fill="#4D7CFE" stroke="white" strokeWidth="2" />
                <circle cx="880" cy="143" r="4.5" fill="#A855F7" stroke="white" strokeWidth="2" />
                <circle cx="880" cy="201" r="4.5" fill="#10B981" stroke="white" strokeWidth="2" />
                <circle cx="880" cy="224" r="4.5" fill="#F97316" stroke="white" strokeWidth="2" />
              </svg>

              {/* Chart Tooltip display */}
              <div className="absolute top-10 right-36 bg-[#0D1424] text-white p-3.5 rounded-xl border border-slate-700 shadow-xl flex flex-col gap-2.5 text-[10px] font-bold min-w-[130px]">
                <div className="text-slate-400 font-bold tracking-wider leading-none">May 16, 2025</div>
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex justify-between items-center gap-4">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium font-sans"><span className="w-1.5 h-1.5 rounded-full bg-[#4D7CFE]" /> Core Hours</span>
                    <span className="font-mono text-white">5,420</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium font-sans"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> GPU Hours</span>
                    <span className="font-mono text-white">1,320</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium font-sans"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Storage (TB)</span>
                    <span className="font-mono text-white">48.6</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium font-sans"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Data Transfer (TB)</span>
                    <span className="font-mono text-white">120</span>
                  </div>
                </div>
              </div>

              {/* Chart Date axis */}
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-2.5 px-4 font-sans">
                <span>Apr 18</span>
                <span>Apr 22</span>
                <span>Apr 26</span>
                <span>Apr 30</span>
                <span>May 4</span>
                <span>May 8</span>
                <span>May 12</span>
                <span>May 16</span>
              </div>
            </div>
          </div>

          {/* Usage by Resource Type table card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Usage by Resource Type</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Allocation limits and real-time usage parameters.</p>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] pb-2">
                    <th className="pb-2.5">Resource</th>
                    <th className="pb-2.5">Consumed</th>
                    <th className="pb-2.5">Limit</th>
                    <th className="pb-2.5">Utilization</th>
                    <th className="pb-2.5 text-right">vs Last Month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {resources.map((res, i) => {
                    const ResIcon = res.icon;
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pr-2 font-bold text-slate-950 flex items-center gap-3.5">
                          <div className={`p-2 rounded-lg border ${
                            res.name === "Core Hours" 
                              ? "bg-blue-50 border-blue-100 text-[#4D7CFE]" 
                              : res.name === "GPU Hours"
                              ? "bg-purple-50 border-purple-100 text-purple-600"
                              : res.name === "Storage"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                              : "bg-orange-50 border-orange-100 text-orange-600"
                          }`}>
                            <ResIcon className="h-4.5 w-4.5" />
                          </div>
                          {res.name}
                        </td>
                        <td className="py-3.5 pr-2 font-bold text-slate-900">{res.consumed}</td>
                        <td className="py-3.5 pr-2 text-slate-400 font-semibold">{res.limit}</td>
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden shrink-0">
                              <div className={`h-full rounded-full ${res.color}`} style={{ width: `${res.progress}%` }} />
                            </div>
                            <span className="text-slate-900 font-extrabold text-[10px]">{res.util}</span>
                          </div>
                        </td>
                        <td className={`py-3.5 text-right font-bold text-[10px] ${res.trendUp ? "text-emerald-600" : "text-red-500"}`}>
                          {res.trendUp ? "↗" : "↘"} {res.trend}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button className="text-[10px] font-extrabold text-[#4D7CFE] hover:underline uppercase tracking-wider text-center mt-3 flex items-center justify-center gap-1.5 cursor-pointer">
              View Detailed Usage Report <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

        {/* Right Column (Usage by Node & Top Projects & Alerts) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          
          {/* Usage by Node */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Usage by Node</h3>
              <button className="text-[9px] font-extrabold text-[#4D7CFE] uppercase hover:underline">View all nodes</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[8px] pb-1.5 font-sans">
                    <th className="pb-2">Node</th>
                    <th className="pb-2">Core Hours</th>
                    <th className="pb-2">GPU Hours</th>
                    <th className="pb-2 text-right">Storage (TB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                  {usageByNode.map((node, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-2.5 pr-1 font-bold text-slate-900">{node.node}</td>
                      <td className="py-2.5 pr-1 font-mono">{node.cores}</td>
                      <td className="py-2.5 pr-1 font-mono">{node.gpus}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-800">{node.storage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="w-full text-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors py-2.5 text-[10px] font-extrabold text-slate-700 cursor-pointer flex items-center justify-center gap-1.5 mt-2">
              View All Nodes <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>

          {/* Top Usage by Project */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Top Usage by Project</h3>
              <button className="text-[9px] font-extrabold text-[#4D7CFE] uppercase hover:underline">View all</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[8px] pb-1.5 font-sans">
                    <th className="pb-2">Project</th>
                    <th className="pb-2">Core Hours</th>
                    <th className="pb-2">GPU Hours</th>
                    <th className="pb-2 text-right">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                  {usageByProject.map((project, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-2.5 pr-1 font-bold text-slate-900">{project.project}</td>
                      <td className="py-2.5 pr-1 font-mono">{project.cores}</td>
                      <td className="py-2.5 pr-1 font-mono">{project.gpus}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-800">{project.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts & Recommendations */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Alerts & Recommendations</h3>
                <span className="bg-amber-100 text-amber-800 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md font-sans">2</span>
              </div>
              <button className="text-[9px] font-extrabold text-[#4D7CFE] uppercase hover:underline">View all</button>
            </div>

            <div className="flex flex-col gap-3.5">
              
              {/* Alert 1 */}
              <div className="flex items-start gap-3 bg-amber-50/30 border border-amber-100 p-3 rounded-xl">
                <span className="p-1 bg-amber-100 rounded-lg text-amber-700 mt-0.5 shrink-0 flex items-center justify-center">
                  <Shield className="h-4 w-4 fill-amber-700/10" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-700 leading-normal font-sans">Storage utilization on <span className="font-bold text-slate-900 font-sans">AEGIS-NODE-02</span> is above 80%.</p>
                </div>
                <button className="text-[9px] font-bold text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer bg-white">View</button>
              </div>

              {/* Alert 2 */}
              <div className="flex items-start gap-3 bg-blue-50/30 border border-blue-100 p-3 rounded-xl">
                <span className="p-1 bg-blue-100 rounded-lg text-[#4D7CFE] mt-0.5 shrink-0 flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-700 leading-normal font-sans">You can save up to <span className="font-bold text-slate-900 font-sans">$320.40</span> by scaling down inactive nodes.</p>
                </div>
                <button className="text-[9px] font-bold text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer bg-white">View</button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Footer Timestamp */}
      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-4 font-sans">
        <span>All usage data is displayed in UTC.</span>
        <span className="flex items-center gap-1.5">Last updated: May 16, 2025 10:30 AM <RotateCcw className="h-3.5 w-3.5 cursor-pointer hover:text-slate-600" /></span>
      </div>

    </div>
  );
}
