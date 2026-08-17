"use client";

import { useState } from "react";
import { useDashboard } from "../DashboardContext";
import {
  Cpu, Database, Monitor, Link2, BriefcaseBusiness, Box, Settings, Search,
  MoreHorizontal, X, ChevronDown, Check, Copy, Plus, Star, ShieldCheck
} from "lucide-react";

export default function MyNodesPage() {
  const { userNodes } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [selectedNodeId, setSelectedNodeId] = useState("node_7f2a8c01");
  const [isDetailOpen, setIsDetailOpen] = useState(true);
  const [detailTab, setDetailTab] = useState<"overview" | "performance" | "details" | "history">("overview");
  const [copied, setCopied] = useState(false);

  const mockDetailsNodes = [
    {
      id: "node_7f2a8c01",
      name: "AEGIS-NODE-01",
      country: "New York, USA",
      region: "us-east",
      ipAddress: "203.0.113.42",
      status: "online" as const,
      latency: 16,
      uptime: "99.7%",
      capabilities: "NVIDIA RTX 4090",
      vram: "24 GB",
      cpu: "Intel i9-13900K",
      ram: "64 GB",
      storage: "2 TB NVMe SSD",
      os: "Ubuntu 22.04 LTS",
      registeredOn: "12 Jan 2025, 10:24 AM",
      lastSeen: "1 min ago",
      computeHrs: "3.21 hrs",
      flag: "🇺🇸"
    },
    {
      id: "node_a91b3d42",
      name: "AEGIS-NODE-02",
      country: "Frankfurt, DE",
      region: "eu-central",
      ipAddress: "198.51.100.85",
      status: "online" as const,
      latency: 18,
      uptime: "99.9%",
      capabilities: "NVIDIA A6000",
      vram: "48 GB",
      cpu: "Intel i9-13900K",
      ram: "64 GB",
      storage: "2 TB NVMe SSD",
      os: "Ubuntu 22.04 LTS",
      registeredOn: "14 Jan 2025, 02:15 PM",
      lastSeen: "2 min ago",
      computeHrs: "2.81 hrs",
      flag: "🇩🇪"
    },
    {
      id: "node_c39d7e11",
      name: "AEGIS-NODE-03",
      country: "Singapore, SG",
      region: "ap-southeast",
      ipAddress: "203.0.113.12",
      status: "offline" as const,
      latency: 0,
      uptime: "-",
      capabilities: "NVIDIA RTX 3090",
      vram: "24 GB",
      cpu: "Intel i9-13900K",
      ram: "64 GB",
      storage: "2 TB NVMe SSD",
      os: "Ubuntu 22.04 LTS",
      registeredOn: "15 Jan 2025, 09:45 AM",
      lastSeen: "3 hours ago",
      computeHrs: "1.40 hrs",
      flag: "🇸🇬"
    }
  ];

  const dbDetailedNodes = userNodes.map((n, i) => {
    const exists = mockDetailsNodes.some(m => m.id === n.id);
    if (exists) return null;
    return {
      id: n.id,
      name: n.name,
      country: n.country,
      region: n.country.toLowerCase().includes("us") || n.country.toLowerCase().includes("york") ? "us-east" : "ap-southeast",
      ipAddress: `203.0.113.${100 + i}`,
      status: (n.status || "online") as "online" | "offline",
      latency: n.latency || 25,
      uptime: "99.9%",
      capabilities: n.capabilities || "NVIDIA RTX 4090",
      vram: n.capabilities.toLowerCase().includes("4090") ? "24 GB" : "48 GB",
      cpu: "Intel i9-13900K",
      ram: "64 GB",
      storage: "2 TB NVMe SSD",
      os: "Ubuntu 22.04 LTS",
      registeredOn: n.lastHeartbeat ? new Date(n.lastHeartbeat).toLocaleString() : "Just Now",
      lastSeen: "Active",
      computeHrs: "1.20 hrs",
      flag: n.country.toLowerCase().includes("germany") || n.country.toLowerCase().includes("de") ? "🇩🇪" : (n.country.toLowerCase().includes("singapore") || n.country.toLowerCase().includes("sg") ? "🇸🇬" : "🇺🇸")
    };
  }).filter(Boolean) as typeof mockDetailsNodes;

  const allDetailedNodes = [...mockDetailsNodes, ...dbDetailedNodes];
  const selectedNode = allDetailedNodes.find(n => n.id === selectedNodeId) || allDetailedNodes[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start text-slate-800">
      {/* Left Column (Nodes list & filters) */}
      <div className={`bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4 ${isDetailOpen ? "lg:col-span-3" : "lg:col-span-4"}`}>
        
        {/* Table filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search nodes..." 
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#4D7CFE] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option>All Status</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
            <select 
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option>All Regions</option>
              <option>us-east</option>
              <option>eu-central</option>
              <option>ap-southeast</option>
            </select>
          </div>
        </div>

        {/* Nodes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] pb-2 font-sans">
                <th className="pb-2.5">Node</th>
                <th className="pb-2.5">Location</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Latency</th>
                <th className="pb-2.5">Uptime</th>
                <th className="pb-2.5">Hardware</th>
                <th className="pb-2.5">Last Seen</th>
                <th className="pb-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {allDetailedNodes
                .filter(node => {
                  const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.country.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesStatus = statusFilter === "All Status" || (statusFilter === "Online" && node.status === "online") || (statusFilter === "Offline" && node.status === "offline");
                  const matchesRegion = regionFilter === "All Regions" || node.region === regionFilter;
                  return matchesSearch && matchesStatus && matchesRegion;
                })
                .map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <tr 
                      key={node.id} 
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        setIsDetailOpen(true);
                      }}
                      className={`hover:bg-slate-50/50 cursor-pointer transition-all ${isSelected ? "bg-slate-50 border-l-4 border-[#4D7CFE]" : ""}`}
                    >
                      <td className="py-3.5 font-semibold text-slate-900 pr-2">
                        <div>{node.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{node.id}</div>
                      </td>
                      <td className="py-3.5 text-slate-500 pr-2">
                        <div className="flex items-center gap-1.5 font-sans">
                          <span>{node.flag}</span>
                          <span>{node.country}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{node.region}</div>
                      </td>
                      <td className="py-3.5 pr-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          node.status === "online" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : "bg-slate-50 text-slate-500 border border-slate-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${node.status === "online" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {node.status === "online" ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-[#4D7CFE] pr-2">
                        {node.status === "online" ? `${node.latency} ms` : "-"}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-600 pr-2 font-mono">
                        {node.uptime}
                      </td>
                      <td className="py-3.5 text-slate-700 pr-2">
                        <div>{node.capabilities}</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{node.vram} VRAM</div>
                      </td>
                      <td className="py-3.5 text-slate-400 pr-2">
                        {node.lastSeen}
                      </td>
                      <td className="py-3.5 text-center" onClick={e => e.stopPropagation()}>
                        <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer">
                          <MoreHorizontal className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4 mt-2 font-sans">
          <span>Showing 1 to {allDetailedNodes.length} of {allDetailedNodes.length} nodes</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400">&lt;</button>
            <button className="px-3 py-1.5 border border-[#4D7CFE] bg-blue-50 text-[#4D7CFE] rounded-lg">1</button>
            <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400">&gt;</button>
          </div>
        </div>
      </div>

      {/* Right Column (Node Details Panel) */}
      {isDetailOpen && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-5 lg:col-span-1 min-h-[500px]">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">{selectedNode.name}</h3>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                  selectedNode.status === "online" 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    : "bg-slate-50 text-slate-500 border border-slate-100"
                }`}>
                  {selectedNode.status}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Connected local cluster details</p>
            </div>
            <button 
              onClick={() => setIsDetailOpen(false)}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="flex border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
            {(["overview", "performance", "details", "history"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setDetailTab(tab)}
                className={`flex-1 text-center pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  detailTab === tab 
                    ? "border-[#4D7CFE] text-slate-900" 
                    : "border-transparent hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {detailTab === "overview" && (
            <div className="flex flex-col gap-5">
              {/* Node Properties key-value List */}
              <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700">
                {[
                  { label: "Node ID", value: selectedNode.id, copy: true },
                  { label: "Location", value: selectedNode.country },
                  { label: "IP Address", value: selectedNode.ipAddress },
                  { label: "Region", value: selectedNode.region },
                  { label: "Registered On", value: selectedNode.registeredOn },
                  { label: "Client Version", value: "v1.2.3" },
                  { label: "Last Seen", value: selectedNode.lastSeen },
                  { label: "Status", value: selectedNode.status === "online" ? "Online" : "Offline", badge: true }
                ].map((prop, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-medium">{prop.label}</span>
                    {prop.copy ? (
                      <span className="font-mono text-slate-600 flex items-center gap-1.5">
                        {prop.value.slice(0, 15)}...
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(prop.value);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </span>
                    ) : prop.badge ? (
                      <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${
                        selectedNode.status === "online" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"
                      }`}>
                        {prop.value}
                      </span>
                    ) : (
                      <span className="text-slate-900 font-bold font-mono text-right">{prop.value}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Hardware Specifications */}
              <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700">
                <h4 className="font-heading font-extrabold text-slate-900 text-[10px] uppercase tracking-widest border-b border-slate-100 pb-1.5 mt-2">Hardware</h4>
                
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-400 font-medium">GPU</span>
                  <span className="text-slate-900 font-bold text-right">{selectedNode.capabilities}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-400 font-medium">VRAM</span>
                  <span className="text-slate-900 font-mono font-bold">{selectedNode.vram}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-400 font-medium">CPU</span>
                  <span className="text-slate-900 font-bold text-right">{selectedNode.cpu}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-400 font-medium">RAM</span>
                  <span className="text-slate-900 font-mono font-bold">{selectedNode.ram}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-400 font-medium">Storage</span>
                  <span className="text-slate-900 font-bold">{selectedNode.storage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium font-sans">OS</span>
                  <span className="text-slate-900 font-bold">{selectedNode.os}</span>
                </div>
              </div>

              <button className="w-full text-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors py-3 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer mt-2">
                <Settings className="h-4 w-4 text-slate-400" /> Manage Node <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          )}

          {detailTab === "performance" && (
            <div className="flex flex-col gap-4 font-semibold text-xs text-slate-700">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col gap-1 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans">Network Latency</span>
                <span className="text-2xl font-extrabold text-[#4D7CFE] mt-1 font-mono">{selectedNode.status === "online" ? `${selectedNode.latency} ms` : "-"}</span>
                <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Excellent Response</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2 mt-2">
                <span className="text-slate-400 font-medium">Core Temp</span>
                <span className="text-slate-900 font-mono font-bold">{selectedNode.status === "online" ? "68°C" : "-"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-medium">Fan Speed</span>
                <span className="text-slate-900 font-mono font-bold">{selectedNode.status === "online" ? "45%" : "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Compute Active</span>
                <span className="text-slate-900 font-mono font-bold">{selectedNode.computeHrs}</span>
              </div>
            </div>
          )}

          {detailTab === "details" && (
            <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-medium">Uptime Guarantee</span>
                <span className="text-slate-900 font-bold">99.9%</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-medium">GPU Generation</span>
                <span className="text-slate-900 font-bold">Ada Lovelace</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Driver Version</span>
                <span className="text-slate-900 font-mono font-bold">CUDA 12.1</span>
              </div>
            </div>
          )}

          {detailTab === "history" && (
            <div className="flex flex-col gap-3.5 font-semibold text-xs text-slate-700">
              {[
                { title: "Heartbeat check successful", time: "1 min ago", status: "success" },
                { title: "Inference task completed", time: "12 mins ago", status: "task" },
                { title: "Inference task completed", time: "24 mins ago", status: "task" },
                { title: "Node initialized successfully", time: "2 days ago", status: "sys" }
              ].map((h, i) => (
                <div key={i} className="flex justify-between items-start gap-2">
                  <div className="flex gap-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${h.status === "success" ? "bg-emerald-500" : h.status === "task" ? "bg-blue-500" : "bg-slate-400"}`} />
                    <span className="text-slate-700 font-medium leading-relaxed">{h.title}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold font-mono shrink-0 mt-0.5">{h.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
