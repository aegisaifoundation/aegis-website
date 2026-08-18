"use client";

import { useState } from "react";
import { useDashboard } from "../DashboardContext";
import {
  Layers, MessageSquare, Download, Search, MoreHorizontal, X, FileText, Check, Copy,
  Plus, ChevronDown, ExternalLink, ShieldCheck
} from "lucide-react";

export default function RequestsPage() {
  const { userRequests, openWorkflow } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedRequestId, setSelectedRequestId] = useState("req_82da1b04");
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const mockRequests = [
    {
      id: "req_82da1b04",
      title: "Inference Node request",
      subtitle: "AEGIS-NODE-04",
      type: "Inference",
      requestedByName: "Gokul S",
      requestedByEmail: "operator@aegis.ai",
      resourceName: "AEGIS-NODE-04",
      resourceLocation: "New York, USA",
      ipAddress: "203.0.113.88",
      gpuSpecs: "NVIDIA RTX 4090",
      vram: "24 GB VRAM",
      ram: "64 GB RAM",
      storage: "2 TB Storage",
      os: "Ubuntu 22.04 LTS",
      clientVersion: "v1.2.3",
      date: "May 16, 2025",
      time: "10:30 AM",
      status: "pending" as const,
      notes: "Submitting request for registering compute resource AEGIS-NODE-04 with NVIDIA RTX 4090 GPU capability to handle active LLM inference tasks."
    },
    {
      id: "req_91ca3b12",
      title: "Marketplace license request",
      subtitle: "Private Agent Pack",
      type: "Marketplace",
      requestedByName: "Gokul S",
      requestedByEmail: "operator@aegis.ai",
      resourceName: "Private Agent Pack",
      resourceLocation: "AEGIS Official",
      ipAddress: "—",
      gpuSpecs: "—",
      vram: "—",
      ram: "—",
      storage: "—",
      os: "—",
      clientVersion: "v1.2.3",
      date: "May 12, 2025",
      time: "02:15 PM",
      status: "approved" as const,
      notes: "Requesting official enterprise installation token license for Vector preprocessor templates."
    },
    {
      id: "req_c32a7b11",
      title: "Developer CLI keys",
      subtitle: "prod_aegis_live key",
      type: "API",
      requestedByName: "Gokul S",
      requestedByEmail: "operator@aegis.ai",
      resourceName: "—",
      resourceLocation: "—",
      ipAddress: "—",
      gpuSpecs: "—",
      vram: "—",
      ram: "—",
      storage: "—",
      os: "—",
      clientVersion: "v1.2.3",
      date: "May 08, 2025",
      time: "09:40 AM",
      status: "approved" as const,
      notes: "Requesting token scopes: inference, downloads, workspace logs."
    }
  ];

  const dbRequests = userRequests.map((r, i) => {
    const exists = mockRequests.some(m => m.id === r.id);
    if (exists) return null;
    return {
      id: r.id,
      title: "Inference Node request",
      subtitle: r.name,
      type: "Inference",
      requestedByName: "Gokul S",
      requestedByEmail: "operator@aegis.ai",
      resourceName: r.name,
      resourceLocation: r.country,
      ipAddress: `203.0.113.${150 + i}`,
      gpuSpecs: r.gpuSpecs,
      vram: "24 GB VRAM",
      ram: "64 GB RAM",
      storage: "2 TB Storage",
      os: "Ubuntu 22.04 LTS",
      clientVersion: "v1.2.3",
      date: r.date.split(",")[0] || "Just Now",
      time: r.date.split(",")[1]?.trim() || "Live",
      status: r.status,
      notes: `User submitted request for registering compute resource "${r.name}" with capabilities "${r.gpuSpecs}".`
    };
  }).filter(Boolean) as typeof mockRequests;

  const allRequests = [...mockRequests, ...dbRequests];
  const selectedRequest = allRequests.find(r => r.id === selectedRequestId) || allRequests[0];

  const [localStatuses, setLocalStatuses] = useState<Record<string, "pending" | "approved" | "rejected" | "quarantined">>({});

  const handleAction = (requestId: string, nextStatus: "approved" | "rejected") => {
    setLocalStatuses(prev => ({ ...prev, [requestId]: nextStatus }));
    // In a live system, we would trigger a Firestore update here.
  };

  const currentStatus = (id: string, def: any) => localStatuses[id] || def;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start text-slate-800">
      
      {/* Left Column (Requests table) */}
      <div className={`bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4 ${isDetailsOpen ? "lg:col-span-3" : "lg:col-span-4"}`}>
        
        {/* Table Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search requests..." 
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#4D7CFE] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option>All Types</option>
              <option>Inference</option>
              <option>Marketplace</option>
              <option>API</option>
            </select>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>In Review</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] pb-2 font-sans">
                <th className="pb-2.5">Request</th>
                <th className="pb-2.5">Type</th>
                <th className="pb-2.5">Operator</th>
                <th className="pb-2.5">Resource</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {allRequests
                .filter(req => {
                  const reqStatus = currentStatus(req.id, req.status);
                  const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) || req.requestedByEmail.toLowerCase().includes(searchQuery.toLowerCase()) || req.id.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesType = typeFilter === "All Types" || req.type === typeFilter;
                  const matchesStatus = statusFilter === "All Status" || 
                    (statusFilter === "Pending" && reqStatus === "pending") || 
                    (statusFilter === "Approved" && reqStatus === "approved") || 
                    (statusFilter === "In Review" && reqStatus === "quarantined") || 
                    (statusFilter === "Rejected" && reqStatus === "rejected");
                  return matchesSearch && matchesType && matchesStatus;
                })
                .map((req) => {
                  const isSelected = req.id === selectedRequestId;
                  const reqStatus = currentStatus(req.id, req.status);
                  return (
                    <tr 
                      key={req.id} 
                      onClick={() => {
                        setSelectedRequestId(req.id);
                        setIsDetailsOpen(true);
                      }}
                      className={`hover:bg-slate-50/50 cursor-pointer transition-all ${isSelected ? "bg-slate-50 border-l-4 border-[#4D7CFE]" : ""}`}
                    >
                      <td className="py-3.5 pr-2 font-semibold text-slate-900">
                        <div>{req.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{req.subtitle}</div>
                      </td>
                      <td className="py-3.5 pr-2 text-slate-500 font-semibold">{req.type}</td>
                      <td className="py-3.5 pr-2">
                        <div className="text-slate-800 font-semibold">{req.requestedByEmail}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{req.requestedByName}</div>
                      </td>
                      <td className="py-3.5 pr-2">
                        {req.resourceName !== "—" ? (
                          <div>
                            <div className="font-semibold text-slate-800">{req.resourceName}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{req.resourceLocation}</div>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          reqStatus === "approved" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : reqStatus === "rejected"
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : reqStatus === "quarantined"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}>
                          {reqStatus === "quarantined" ? "In Review" : reqStatus}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2">
                        <div className="text-slate-800 font-semibold">{req.date}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{req.time}</div>
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

        {/* Footer pagination */}
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4 mt-2 font-sans">
          <span>Showing 1 to {allRequests.length} of {allRequests.length} requests</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400">&lt;</button>
            <button className="px-3 py-1.5 border border-[#4D7CFE] bg-blue-50 text-[#4D7CFE] rounded-lg">1</button>
            <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400">&gt;</button>
          </div>
        </div>
      </div>

      {/* Right Column (Request Details Card Sidebar) */}
      {isDetailsOpen && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-5 lg:col-span-1 min-h-[500px]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Request Details</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Audit log and approval decision</p>
            </div>
            <button 
              onClick={() => setIsDetailsOpen(false)}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Request details card */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-3 justify-between">
            <div className="min-w-0 flex items-center gap-3">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-slate-900 truncate">{selectedRequest.title}</h4>
                <p className="text-[9px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">{selectedRequest.id}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${
              currentStatus(selectedRequest.id, selectedRequest.status) === "approved" 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                : currentStatus(selectedRequest.id, selectedRequest.status) === "rejected"
                ? "bg-red-50 text-red-600 border border-red-100"
                : currentStatus(selectedRequest.id, selectedRequest.status) === "quarantined"
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}>
              {currentStatus(selectedRequest.id, selectedRequest.status) === "quarantined" ? "In Review" : currentStatus(selectedRequest.id, selectedRequest.status)}
            </span>
          </div>

          {/* Details list */}
          <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700 border-b border-slate-100 pb-4">
            <h4 className="font-heading font-extrabold text-slate-900 text-[10px] uppercase tracking-widest border-b border-slate-100 pb-1.5">Overview</h4>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Requested By</span>
              <span className="text-slate-900 font-bold text-right">{selectedRequest.requestedByEmail} <div className="text-[10px] text-slate-400 font-normal mt-0.5">{selectedRequest.requestedByName}</div></span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-50 pt-2">
              <span className="text-slate-400 font-medium">Request Type</span>
              <span className="text-slate-900 font-bold">{selectedRequest.type}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-50 pt-2">
              <span className="text-slate-400 font-medium">Requested On</span>
              <span className="text-slate-900 font-mono font-bold text-right">{selectedRequest.date}, {selectedRequest.time}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-50 pt-2">
              <span className="text-slate-400 font-medium">Status</span>
              <span className="text-slate-900 capitalize font-bold">{currentStatus(selectedRequest.id, selectedRequest.status) === "quarantined" ? "In Review" : currentStatus(selectedRequest.id, selectedRequest.status)}</span>
            </div>
          </div>

          {/* Node specs */}
          {selectedRequest.resourceName !== "—" && (
            <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700 border-b border-slate-100 pb-4">
              <h4 className="font-heading font-extrabold text-slate-900 text-[10px] uppercase tracking-widest border-b border-slate-100 pb-1.5 font-sans">Node Information</h4>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Node Name</span>
                <span className="text-slate-900 font-bold">{selectedRequest.resourceName}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                <span className="text-slate-400 font-medium">Location</span>
                <span className="text-slate-900 font-bold">{selectedRequest.resourceLocation}</span>
              </div>
              {selectedRequest.gpuSpecs !== "—" && (
                <>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                    <span className="text-slate-400 font-medium">Compute</span>
                    <span className="text-slate-900 font-bold">{selectedRequest.gpuSpecs}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                    <span className="text-slate-400 font-medium">VRAM</span>
                    <span className="text-slate-900 font-mono font-bold">{selectedRequest.vram}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Additional details */}
          <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700">
            <h4 className="font-heading font-extrabold text-slate-900 text-[10px] uppercase tracking-widest border-b border-slate-100 pb-1.5">Additional Information</h4>
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 font-medium">Notes</span>
              <p className="text-slate-700 font-medium leading-relaxed mt-1 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">{selectedRequest.notes}</p>
            </div>
          </div>

          {/* Decision buttons */}
          {currentStatus(selectedRequest.id, selectedRequest.status) === "pending" && (
            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-slate-100">
              <button 
                onClick={() => handleAction(selectedRequest.id, "rejected")}
                className="w-full text-center rounded-xl border border-red-200 hover:bg-red-50 transition-colors py-3 text-xs font-bold text-red-500 cursor-pointer"
              >
                Reject
              </button>
              <button 
                onClick={() => handleAction(selectedRequest.id, "approved")}
                className="w-full text-center rounded-xl bg-[#0D1424] hover:bg-slate-800 text-white transition-all py-3 text-xs font-bold cursor-pointer"
              >
                Approve
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
