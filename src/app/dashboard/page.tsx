"use client";

import { useDashboard } from "./DashboardContext";
import {
  Cpu, Activity, CloudDownload, Coins, Star
} from "lucide-react";

export default function OverviewPage() {
  const { userNodes } = useDashboard();

  // Simulated static telemetry data matching the clean light dashboard aesthetics
  const telemetry = {
    latency: 16,
    processed: "1.24 TB",
    earnings: "4.21 AGS"
  };

  return (
    <div className="flex flex-col gap-8 text-slate-800">
      {/* Metrics cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Active Nodes */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Nodes</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{userNodes.length || 3}</h3>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">All systems operational</span>
          </div>
        </div>

        {/* Network Latency */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Network Latency</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{telemetry.latency} ms</h3>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Excellent</span>
          </div>
        </div>

        {/* Data Processed */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data Processed</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{telemetry.processed}</h3>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
              <CloudDownload className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Up 12.4% this week</span>
          </div>
        </div>

        {/* Yield Earned */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Yield Earned</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{telemetry.earnings}</h3>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimated earnings</span>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Compute Hours chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4 xl:col-span-2 min-h-[300px]">
          <div>
            <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Compute Hours by Node</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Aggregated weekly compute time allocation.</p>
          </div>

          <div className="flex items-center gap-10 mt-2.5">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Track */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                {/* Segment 1: Node-01 (43%) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="#4D7CFE" 
                  strokeWidth="3.5" 
                  strokeDasharray="43 100" 
                  strokeDashoffset="0" 
                />
                {/* Segment 2: Node-02 (38%) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="#7dd3fc" 
                  strokeWidth="3.5" 
                  strokeDasharray="38 100" 
                  strokeDashoffset="-43" 
                />
                {/* Segment 3: Node-03 (19%) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="#cbd5e1" 
                  strokeWidth="3.5" 
                  strokeDasharray="19 100" 
                  strokeDashoffset="-81" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold text-slate-900 leading-none">7.42</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1 font-sans">GPU hrs</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex flex-col gap-3 font-semibold text-[11px] text-slate-600 flex-1">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4D7CFE]" /> Node-01</span>
                <span className="font-mono text-slate-900">3.21 hrs</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2.5">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7dd3fc]" /> Node-02</span>
                <span className="font-mono text-slate-900">2.81 hrs</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2.5">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" /> Node-03</span>
                <span className="font-mono text-slate-900">1.40 hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Node Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4 min-h-[300px]">
          <div>
            <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Top Performing Node</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Highest monthly yield</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/0 border border-amber-500/10 p-5 rounded-2xl flex flex-col gap-4 justify-between flex-1 mt-1">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">AEGIS-NODE-02</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Frankfurt, DE</p>
                </div>
              </div>
              <span className="text-[8px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-sans">
                Online
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-amber-500/10 pt-4 text-center">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans">Uptime</span>
                <p className="text-sm font-extrabold text-slate-800 mt-1 font-mono">99.9%</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans">Compute</span>
                <p className="text-sm font-extrabold text-amber-600 mt-1 font-mono">2.81 GPU hrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
