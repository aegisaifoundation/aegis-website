"use client";

import { useState } from "react";
import { useDashboard } from "../DashboardContext";
import {
  Search, ChevronDown, Plus, Calendar, Tag, Cpu, Package, Shield, Share2,
  Database, Globe, Sliders, MoreHorizontal, ChevronLeft, ChevronRight
} from "lucide-react";

interface RequestItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  typeIcon: React.ComponentType<{ className?: string }>;
  icon: React.ComponentType<{ className?: string }>;
  status: "Pending" | "Processing" | "Approved" | "Completed" | "Cancelled";
  statusColor: string;
  created: string;
}

export default function RequestsPage() {
  const { openWorkflow } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [timeFilter, setTimeFilter] = useState("All Time");

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Exact mock requests matching screenshot
  const initialRequests: RequestItem[] = [
    {
      id: "req_01",
      title: "AEGIS-NODE-04",
      subtitle: "Register new node",
      type: "Node Registration",
      typeIcon: Tag,
      icon: Sliders,
      status: "Pending",
      statusColor: "amber",
      created: "2m ago",
    },
    {
      id: "req_02",
      title: "Distributed Inference",
      subtitle: "2 GPU nodes  •  ~2.5 hours",
      type: "Compute Request",
      typeIcon: Cpu,
      icon: Cpu,
      status: "Processing",
      statusColor: "blue",
      created: "18m ago",
    },
    {
      id: "req_03",
      title: "Install @aegis/federated-learning",
      subtitle: "Version 1.4.2  •  Target: AEGIS-NODE-02",
      type: "Package Deployment",
      typeIcon: Package,
      icon: Package,
      status: "Approved",
      statusColor: "emerald",
      created: "1h ago",
    },
    {
      id: "req_04",
      title: "Node Verification",
      subtitle: "Verify identity of AEGIS-NODE-02",
      type: "Security",
      typeIcon: Shield,
      icon: Shield,
      status: "Pending",
      statusColor: "amber",
      created: "2h ago",
    },
    {
      id: "req_05",
      title: "Medical Classification Model",
      subtitle: "5 nodes  •  20 rounds",
      type: "Federated Training",
      typeIcon: Share2,
      icon: Share2,
      status: "Completed",
      statusColor: "purple",
      created: "5h ago",
    },
    {
      id: "req_06",
      title: "GPU Allocation",
      subtitle: "2 × GPU  •  6 hours  •  AEGIS-NODE-03",
      type: "Resource Request",
      typeIcon: Database,
      icon: Database,
      status: "Cancelled",
      statusColor: "slate",
      created: "1d ago",
    },
    {
      id: "req_07",
      title: "Join Federation",
      subtitle: 'Request to join "Aegis Research Network"',
      type: "Network",
      typeIcon: Globe,
      icon: Globe,
      status: "Approved",
      statusColor: "emerald",
      created: "2d ago",
    },
  ];

  const filteredRequests = initialRequests.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "All Types" || req.type === typeFilter;
    const matchesStatus = statusFilter === "All Status" || req.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-140px)] text-white font-body px-2">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Requests
            </h1>
            <p className="text-xs md:text-sm text-white/40 mt-1 font-normal">
              Track, monitor and manage requests across the AEGIS network.
            </p>
          </div>

          <button
            onClick={() => openWorkflow("request")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Request</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search Bar */}
          <div className="flex items-center gap-3 bg-[#161616] border border-white/[0.08] rounded-xl px-3.5 py-2.5 flex-1 min-w-[240px] max-w-md focus-within:border-white/20 transition-colors">
            <Search className="w-4 h-4 text-white/30 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requests..."
              className="w-full bg-transparent text-xs text-white placeholder:text-white/30 outline-none"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-3">
            {/* Filter 1: All Types */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsTypeDropdownOpen((p) => !p);
                  setIsStatusDropdownOpen(false);
                  setIsTimeDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#161616] hover:bg-[#202020] border border-white/[0.08] rounded-xl text-xs font-medium text-white/80 transition-all cursor-pointer"
              >
                <span>{typeFilter}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-44 bg-[#161616] border border-white/[0.08] rounded-xl shadow-xl z-30 py-1 font-sans">
                  {["All Types", "Node Registration", "Compute Request", "Package Deployment", "Security", "Federated Training", "Resource Request", "Network"].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTypeFilter(t);
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        typeFilter === t
                          ? "text-white font-semibold bg-white/10"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter 2: All Status */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsStatusDropdownOpen((p) => !p);
                  setIsTypeDropdownOpen(false);
                  setIsTimeDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#161616] hover:bg-[#202020] border border-white/[0.08] rounded-xl text-xs font-medium text-white/80 transition-all cursor-pointer"
              >
                <span>{statusFilter}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-36 bg-[#161616] border border-white/[0.08] rounded-xl shadow-xl z-30 py-1 font-sans">
                  {["All Status", "Pending", "Processing", "Approved", "Completed", "Cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatusFilter(s);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        statusFilter === s
                          ? "text-white font-semibold bg-white/10"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter 3: All Time */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsTimeDropdownOpen((p) => !p);
                  setIsTypeDropdownOpen(false);
                  setIsStatusDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#161616] hover:bg-[#202020] border border-white/[0.08] rounded-xl text-xs font-medium text-white/80 transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span>{timeFilter}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isTimeDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isTimeDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-36 bg-[#161616] border border-white/[0.08] rounded-xl shadow-xl z-30 py-1 font-sans">
                  {["All Time", "Past 24 Hours", "Past 7 Days", "Past 30 Days"].map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setTimeFilter(time);
                        setIsTimeDropdownOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        timeFilter === time
                          ? "text-white font-semibold bg-white/10"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="flex flex-col">
          {/* Table Column Headers */}
          <div className="grid grid-cols-12 px-3 pb-3 text-[10px] font-bold text-white/30 tracking-widest uppercase border-b border-white/[0.08]">
            <div className="col-span-5">REQUEST</div>
            <div className="col-span-3">TYPE</div>
            <div className="col-span-2">STATUS</div>
            <div className="col-span-2 text-right pr-8">CREATED</div>
          </div>

          {/* Table Rows */}
          {filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-xs text-white/30">
              No requests found matching your filters.
            </div>
          ) : (
            filteredRequests.map((req) => {
              const LeftIcon = req.icon;
              const TypeIcon = req.typeIcon;

              let dotColor = "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]";
              let textColor = "text-amber-400";
              if (req.status === "Processing") {
                dotColor = "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]";
                textColor = "text-blue-400";
              } else if (req.status === "Approved") {
                dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]";
                textColor = "text-emerald-400";
              } else if (req.status === "Completed") {
                dotColor = "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]";
                textColor = "text-purple-400";
              } else if (req.status === "Cancelled") {
                dotColor = "bg-slate-500";
                textColor = "text-white/40";
              }

              return (
                <div
                  key={req.id}
                  className="grid grid-cols-12 items-center px-3 py-4 border-b border-white/[0.06] hover:bg-white/[0.015] transition-colors rounded-lg group"
                >
                  {/* Request Title & Icon */}
                  <div className="col-span-5 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/70 shrink-0">
                      <LeftIcon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-sm font-bold text-white tracking-wide truncate">
                        {req.title}
                      </span>
                      <span className="text-xs text-white/40 mt-0.5 truncate">
                        {req.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="col-span-3 flex items-center gap-2 text-xs font-semibold text-white">
                    <TypeIcon className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="truncate">{req.type}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <span className={`text-xs font-medium ${textColor}`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Created & Action */}
                  <div className="col-span-2 flex items-center justify-end gap-6">
                    <span className="text-xs text-white/40 font-mono">
                      {req.created}
                    </span>
                    <button className="p-1 text-white/30 hover:text-white transition-colors cursor-pointer">
                      <MoreHorizontal className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-white/40 py-6 mt-8 border-t border-white/[0.06]">
        <span>Showing 1 to 7 of 28 requests</span>

        <div className="flex items-center gap-1.5">
          <button className="p-1.5 text-white/30 hover:text-white transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button className="px-3 py-1 bg-[#1a1a1a] border border-white/[0.08] rounded-lg text-white font-bold text-xs">
            1
          </button>
          <button className="px-3 py-1 text-white/40 hover:text-white font-medium text-xs transition-colors cursor-pointer">
            2
          </button>
          <button className="px-3 py-1 text-white/40 hover:text-white font-medium text-xs transition-colors cursor-pointer">
            3
          </button>
          <button className="px-3 py-1 text-white/40 hover:text-white font-medium text-xs transition-colors cursor-pointer">
            4
          </button>

          <button className="p-1.5 text-white/30 hover:text-white transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
