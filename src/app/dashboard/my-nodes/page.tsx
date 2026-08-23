"use client";

import { useState } from "react";
import { useDashboard } from "../DashboardContext";
import {
  Search, ChevronDown, Plus, Trash2, MapPin, Shield, Sliders
} from "lucide-react";

interface NodeItem {
  id: string;
  name: string;
  location: string;
  region: string;
  status: "online" | "busy" | "offline";
  enabled: boolean;
  lastSeen: string;
}

export default function MyNodesPage() {
  const { userNodes } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Initial nodes matching screenshot
  const initialNodes: NodeItem[] = [
    {
      id: "aegs_01ny7f2k3",
      name: "AEGIS-NODE-01",
      location: "New York, USA",
      region: "us-east-1",
      status: "online",
      enabled: true,
      lastSeen: "2m ago",
    },
    {
      id: "aegs_02fr4d9k1",
      name: "AEGIS-NODE-02",
      location: "Frankfurt, DE",
      region: "eu-central-1",
      status: "online",
      enabled: true,
      lastSeen: "1m ago",
    },
    {
      id: "aegs_03sg2h8m7",
      name: "AEGIS-NODE-03",
      location: "Singapore, SG",
      region: "ap-southeast-1",
      status: "busy",
      enabled: true,
      lastSeen: "3m ago",
    },
    {
      id: "aegs_04lon9p2q",
      name: "AEGIS-NODE-04",
      location: "London, UK",
      region: "eu-west-2",
      status: "offline",
      enabled: false,
      lastSeen: "1h ago",
    },
  ];

  const [nodes, setNodes] = useState<NodeItem[]>(initialNodes);

  // Include any newly registered user nodes from database
  const activeNodes = [
    ...nodes,
    ...userNodes
      .filter((n) => !nodes.some((existing) => existing.name === n.name))
      .map((n, idx) => ({
        id: n.id || `aegs_0${idx + 5}custom`,
        name: n.name,
        location: n.country || "United States",
        region: "us-east-1",
        status: (n.status || "online") as "online" | "busy" | "offline",
        enabled: true,
        lastSeen: "Just now",
      })),
  ];

  const handleToggleEnable = (id: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, enabled: !node.enabled } : node
      )
    );
  };

  const handleDeleteNode = (id: string) => {
    if (confirm("Are you sure you want to delete this node?")) {
      setNodes((prev) => prev.filter((node) => node.id !== id));
    }
  };

  const filteredNodes = activeNodes.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Online" && node.status === "online") ||
      (statusFilter === "Busy" && node.status === "busy") ||
      (statusFilter === "Offline" && node.status === "offline");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-140px)] text-white font-body px-2">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              My Nodes
            </h1>
            <p className="text-xs md:text-sm text-white/40 mt-1 font-normal">
              View and manage your AI compute nodes.
            </p>
          </div>

          <button
            onClick={() => {
              // Trigger command palette or modal
              const kEvt = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true });
              window.dispatchEvent(kEvt);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Node</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="w-4 h-4 text-white/40 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#161616] hover:bg-[#202020] border border-white/[0.08] rounded-xl text-xs font-medium text-white/80 transition-all cursor-pointer"
            >
              <span>{statusFilter}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-36 bg-[#161616] border border-white/[0.08] rounded-xl shadow-xl z-30 py-1 font-sans">
                {["All Status", "Online", "Busy", "Offline"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                      statusFilter === status
                        ? "text-white font-semibold bg-white/10"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nodes List */}
        <div className="flex flex-col">
          {filteredNodes.length === 0 ? (
            <div className="py-16 text-center text-xs text-white/30">
              No compute nodes found matching your criteria.
            </div>
          ) : (
            filteredNodes.map((node) => (
              <div
                key={node.id}
                className="flex items-center justify-between py-5 border-b border-white/[0.06] hover:bg-white/[0.01] transition-colors px-2 rounded-lg"
              >
                {/* Name & ID */}
                <div className="flex items-center gap-4 min-w-[220px]">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/60 shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {node.name}
                    </span>
                    <span className="text-xs text-white/40 font-mono mt-0.5">
                      ID: {node.id}
                    </span>
                  </div>
                </div>

                {/* Location & Region */}
                <div className="flex flex-col min-w-[180px]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <span>{node.location}</span>
                  </div>
                  <span className="text-xs text-white/40 font-mono mt-0.5 pl-5">
                    {node.region}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        node.status === "online"
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : node.status === "busy"
                          ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "bg-slate-500"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium capitalize ${
                        node.status === "online"
                          ? "text-emerald-400"
                          : node.status === "busy"
                          ? "text-amber-400"
                          : "text-white/40"
                      }`}
                    >
                      {node.status === "online"
                        ? "Online"
                        : node.status === "busy"
                        ? "Busy"
                        : "Offline"}
                    </span>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex flex-col items-center min-w-[100px]">
                  <button
                    onClick={() => handleToggleEnable(node.id)}
                    className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer p-0.5 ${
                      node.enabled ? "bg-emerald-500" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        node.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-[10px] text-white/40 font-medium mt-1">
                    {node.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                {/* Last Seen */}
                <div className="flex flex-col items-end min-w-[120px]">
                  <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
                    Last seen
                  </span>
                  <span className="text-xs font-bold text-white mt-0.5 font-mono">
                    {node.lastSeen}
                  </span>
                </div>

                {/* Delete Button */}
                <div className="pl-4">
                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="p-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Node"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Privacy Banner */}
      <div className="flex items-center justify-center gap-2 text-white/30 text-xs py-6 mt-12">
        <Shield className="w-3.5 h-3.5 shrink-0 text-white/40" />
        <span>Your AEGIS data and settings are private and secure.</span>
        <a
          href="/dashboard/settings"
          className="text-white/50 hover:text-white font-medium underline transition-colors cursor-pointer"
        >
          Learn more
        </a>
      </div>
    </div>
  );
}
