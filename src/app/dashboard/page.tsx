"use client";

import { useDashboard } from "./DashboardContext";
import { useRouter } from "next/navigation";
import {
  Server, Activity, Database, Coins, ChevronRight, FileText, KeyRound, BookOpen, ShieldCheck, Check, ShoppingBag
} from "lucide-react";

export default function OverviewPage() {
  const { userNodes, userRequests, openWorkflow } = useDashboard();
  const router = useRouter();

  // Active compute nodes display logic (from context or fallback to mock)
  const displayNodes = userNodes.length > 0 ? userNodes.slice(0, 3) : [
    { id: "1", name: "AEGIS-NODE-01", country: "New York, USA", status: "online" as const, latency: 16, uptime: "99.7%" },
    { id: "2", name: "AEGIS-NODE-02", country: "Frankfurt, DE", status: "online" as const, latency: 18, uptime: "99.9%" },
    { id: "3", name: "AEGIS-NODE-03", country: "Singapore, SG", status: "busy" as const, latency: 22, uptime: "98.4%" },
  ];

  // Recent requests display logic (from context or fallback to mock)
  const displayRequests = userRequests.length > 0 ? userRequests.slice(0, 3) : [
    { id: "1", name: "Node Registration", subtitle: "AEGIS-NODE-04", status: "pending" as const, time: "2h ago" },
    { id: "2", name: "Increase API Limit", subtitle: "Daily limit to 20k", status: "approved" as const, time: "1d ago" },
    { id: "3", name: "Support Ticket", subtitle: "Latency issues on Node-02", status: "in-review" as const, time: "2d ago" },
  ];

  return (
    <div className="flex flex-col gap-6 text-slate-800">
      
      {/* Row 1: Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Active Nodes */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[120px] transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 shrink-0">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Nodes</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{userNodes.length || 3}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 pl-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">All systems operational</span>
          </div>
        </div>

        {/* Card 2: Network Latency */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[120px] transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Network Latency</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">18 ms</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 pl-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Excellent</span>
          </div>
        </div>

        {/* Card 3: Data Processed */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[120px] transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Processed</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">4.28 TB</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3.5 pl-0.5">
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">+12.4% this week</span>
          </div>
        </div>

        {/* Card 4: Credits Earned */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[120px] transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 shrink-0">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credits Earned</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">1,284 AGS</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3.5 pl-0.5">
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">+8.7% this week</span>
          </div>
        </div>

      </div>

      {/* Row 2: Compute Nodes, Network Activity, Current Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: My AI Compute Nodes */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-4 lg:col-span-5 min-h-[350px]">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">My AI Compute Nodes</h3>
            <button 
              onClick={() => router.push("/dashboard/my-nodes")}
              className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 font-bold text-slate-500 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 pb-3">Node Name</th>
                  <th className="py-2.5 pb-3">Location</th>
                  <th className="py-2.5 pb-3">Status</th>
                  <th className="py-2.5 pb-3 text-right">Latency</th>
                  <th className="py-2.5 pb-3 text-right">Uptime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-900">{node.name}</td>
                    <td className="py-3 text-slate-500">{node.country}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${
                        node.status === "online" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                          : node.status === "busy" 
                            ? "bg-amber-50 text-amber-600 border-amber-100/50"
                            : "bg-slate-50 text-slate-500 border-slate-200/50"
                      }`}>
                        {node.status === "online" ? "Online" : node.status === "busy" ? "Busy" : "Offline"}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-700">{node.latency} ms</td>
                    <td className="py-3 text-right font-mono text-slate-700">{node.uptime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Middle Column: Network Activity (Live) */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col justify-between lg:col-span-4 min-h-[350px]">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Network Activity (Live)</h3>
            <button className="flex items-center gap-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 font-bold text-slate-500 transition-colors cursor-pointer">
              <span>24 Hours</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>
          
          {/* Custom SVG Line Chart */}
          <div className="w-full h-44 mt-3 select-none">
            <svg className="w-full h-full" viewBox="0 0 400 160">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4D7CFE" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#4D7CFE" stopOpacity="0.00" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <text x="5" y="18" className="text-[10px] font-bold fill-slate-400">100</text>
              <line x1="30" y1="15" x2="390" y2="15" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              
              <text x="5" y="53" className="text-[10px] font-bold fill-slate-400">75</text>
              <line x1="30" y1="50" x2="390" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              
              <text x="5" y="88" className="text-[10px] font-bold fill-slate-400">50</text>
              <line x1="30" y1="85" x2="390" y2="85" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              
              <text x="5" y="123" className="text-[10px] font-bold fill-slate-400">25</text>
              <line x1="30" y1="120" x2="390" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              
              <text x="5" y="153" className="text-[10px] font-bold fill-slate-400">0</text>
              <line x1="30" y1="150" x2="390" y2="150" stroke="#e2e8f0" strokeWidth="1" />
              
              {/* Chart Gradient Fill */}
              <path 
                d="M 30,120 C 60,130 75,100 90,110 C 110,120 120,90 135,95 C 150,100 165,70 180,75 C 195,80 210,105 225,100 C 240,95 255,50 270,45 C 285,40 300,80 315,75 C 330,70 345,55 360,50 C 375,45 380,75 390,70 L 390,150 L 30,150 Z"
                fill="url(#chart-grad)"
              />
              
              {/* Chart Line */}
              <path 
                d="M 30,120 C 60,130 75,100 90,110 C 110,120 120,90 135,95 C 150,100 165,70 180,75 C 195,80 210,105 225,100 C 240,95 255,50 270,45 C 285,40 300,80 315,75 C 330,70 345,55 360,50 C 375,45 380,75 390,70"
                fill="none"
                stroke="#4D7CFE"
                strokeWidth="2.2"
              />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 tracking-wider px-7 mt-2">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>

          <div className="border-t border-slate-50 pt-3.5 mt-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Real-time network performance</span>
          </div>
        </div>

        {/* Right Column: Current Plan */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col justify-between lg:col-span-3 min-h-[350px]">
          <div>
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Current Plan</h3>
              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded uppercase tracking-widest">
                Active
              </span>
            </div>
            
            <div className="mt-4">
              <h4 className="text-xl font-extrabold text-slate-900">AEGIS Pro</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Renews on 24 May 2027</p>
            </div>

            <div className="flex flex-col gap-3.5 mt-6">
              {[
                "Up to 10 Compute Nodes",
                "Advanced Analytics",
                "Priority Support",
                "Higher API Limits"
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Check className="h-4 w-4 text-[#4D7CFE] shrink-0 stroke-[2.5]" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => openWorkflow("upgrade")}
            className="w-full text-center border border-slate-200 rounded-xl py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer mt-6"
          >
            Manage Plan
          </button>
        </div>

      </div>

      {/* Row 3: Recent Requests, Usage This Week, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Recent Requests */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-4 lg:col-span-5 min-h-[300px]">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Recent Requests</h3>
            <button 
              onClick={() => router.push("/dashboard/requests")}
              className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 font-bold text-slate-500 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex flex-col mt-2">
            {displayRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{req.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{req.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold border rounded uppercase tracking-wider ${
                    req.status === "approved"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                      : req.status === "pending"
                        ? "bg-blue-50 text-blue-600 border-blue-100/50"
                        : "bg-indigo-50 text-indigo-600 border-indigo-100/50"
                  }`}>
                    {req.status === "approved" ? "Approved" : req.status === "pending" ? "Pending" : "In Review"}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 w-12">{req.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column: Usage This Week */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col justify-between lg:col-span-4 min-h-[300px]">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Usage This Week</h3>
            <button 
              onClick={() => router.push("/dashboard/usage")}
              className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 font-bold text-slate-500 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex items-center gap-6 mt-3">
            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background track */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                {/* Compute (78%) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="#4D7CFE" 
                  strokeWidth="3.4" 
                  strokeDasharray="78 100" 
                  strokeDashoffset="0" 
                />
                {/* Storage (14%) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="#1d4ed8" 
                  strokeWidth="3.4" 
                  strokeDasharray="14 100" 
                  strokeDashoffset="-78" 
                />
                {/* Transfer (8%) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="#93c5fd" 
                  strokeWidth="3.4" 
                  strokeDasharray="8 100" 
                  strokeDashoffset="-92" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-slate-900 leading-none">78%</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">of 10 TB</span>
              </div>
            </div>
            
            {/* Legends */}
            <div className="flex flex-col gap-2.5 font-semibold text-[11px] text-slate-600 flex-1">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.2 h-2.2 rounded-full bg-[#4D7CFE]" />
                  Compute
                </span>
                <span className="font-mono text-slate-950 font-bold">7.8 TB</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.2 h-2.2 rounded-full bg-[#1d4ed8]" />
                  Storage
                </span>
                <span className="font-mono text-slate-950 font-bold">1.4 TB</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.2 h-2.2 rounded-full bg-[#93c5fd]" />
                  Transfer
                </span>
                <span className="font-mono text-slate-950 font-bold">0.8 TB</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Total Used:</span>
            <span className="text-slate-700 font-bold font-mono text-[11px] normal-case">10.0 TB / 12.0 TB</span>
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-4 lg:col-span-3 min-h-[300px]">
          <div>
            <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Quick Actions</h3>
          </div>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => openWorkflow("request")}
              className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Server className="h-4.5 w-4.5 text-slate-400 group-hover:text-[#4D7CFE] transition-colors" />
                <span className="text-xs font-bold text-slate-700">Register New Node</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
            
            <button 
              onClick={() => router.push("/dashboard/marketplace")}
              className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4.5 w-4.5 text-slate-400 group-hover:text-[#4D7CFE] transition-colors" />
                <span className="text-xs font-bold text-slate-700">Browse Marketplace</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button 
              onClick={() => openWorkflow("api-key")}
              className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <KeyRound className="h-4.5 w-4.5 text-slate-400 group-hover:text-[#4D7CFE] transition-colors" />
                <span className="text-xs font-bold text-slate-700">Generate API Key</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button 
              onClick={() => router.push("/dashboard/support")}
              className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4.5 w-4.5 text-slate-400 group-hover:text-[#4D7CFE] transition-colors" />
                <span className="text-xs font-bold text-slate-700">View Documentation</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          </div>
        </div>

      </div>

      {/* Row 4: Status Alert (Bottom-most) */}
      <div className="flex items-center justify-between p-4 bg-emerald-50/45 border border-emerald-100/70 rounded-2xl mt-2">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">AEGIS Network Status</h4>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              All systems operational. The AEGIS network is healthy and fully operational.
            </p>
          </div>
        </div>
        <button 
          onClick={() => router.push("/dashboard/support")}
          className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
        >
          <span>View Status Page</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>

    </div>
  );
}
