"use client";

import { useState } from "react";
import { useDashboard } from "../DashboardContext";
import {
  Box, CloudDownload, ShieldCheck, Search, Cpu, Database, Layers, Activity,
  Terminal, X, ChevronDown, Check, Copy, Plus, Star, ExternalLink, ArrowRight
} from "lucide-react";

function ArrowUpCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 12 12 8 8 12" />
      <line x1="12" y1="16" x2="12" y2="8" />
    </svg>
  );
}

export default function MarketplacePage() {
  const { openWorkflow } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortOrder, setSortOrder] = useState("Sort by: Popular");
  const [activeTab, setActiveTab] = useState<"all" | "installed" | "updates">("all");
  const [selectedPackageId, setSelectedPackageId] = useState("AEGIS Inference Engine");
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [detailTab, setDetailTab] = useState<"overview" | "versions" | "changelog" | "dependencies">("overview");

  const [localStatuses, setLocalStatuses] = useState<Record<string, "Installed" | "Available" | "Update Available">>({});

  const packagesData = [
    {
      id: "AEGIS Inference Engine",
      name: "AEGIS Inference Engine",
      subtitle: "High-performance inference engine optimized for distributed AI workloads.",
      category: "Inference",
      version: "2.4.1",
      date: "May 10, 2025",
      status: "Installed" as const,
      compatibility: "v2.0.0+",
      downloads: "12.4K",
      description: "High-performance inference engine optimized for distributed AI workloads across the AEGIS network. Supports multiple model formats and GPU acceleration.",
      publisher: "AEGIS Foundation",
      license: "Apache-2.0",
      size: "152.4 MB",
      securityStatus: "Verified",
      platforms: ["Linux", "Windows", "macOS"],
      cpu: "2 cores",
      ram: "4 GB",
      gpu: "NVIDIA CUDA 11.0+",
      storage: "500 MB",
      icon: Cpu
    },
    {
      id: "Vector Database",
      name: "Vector Database",
      subtitle: "Scalable vector database for embeddings and similarity search.",
      category: "Data",
      version: "1.6.0",
      date: "May 8, 2025",
      status: "Installed" as const,
      compatibility: "v1.5.0+",
      downloads: "8.7K",
      description: "Scalable vector database for high-dimensional embeddings and real-time similarity search. Built for sub-millisecond retrieval query speeds.",
      publisher: "AEGIS Foundation",
      license: "Apache-2.0",
      size: "94.1 MB",
      securityStatus: "Verified",
      platforms: ["Linux", "macOS"],
      cpu: "4 cores",
      ram: "8 GB",
      gpu: "None",
      storage: "10 GB",
      icon: Database
    },
    {
      id: "LLM Runtime",
      name: "LLM Runtime",
      subtitle: "Optimized runtime for large language models with GPU acceleration.",
      category: "Runtime",
      version: "3.2.0",
      date: "May 11, 2025",
      status: "Update Available" as const,
      compatibility: "v2.8.0+",
      downloads: "6.3K",
      description: "An optimized runtime for executing large language models locally or distributed. Features model quantization and aggressive hardware offloading.",
      publisher: "AEGIS Foundation",
      license: "MIT",
      size: "210.8 MB",
      securityStatus: "Verified",
      platforms: ["Linux", "Windows", "macOS"],
      cpu: "4 cores",
      ram: "16 GB",
      gpu: "NVIDIA CUDA 11.8+",
      storage: "20 GB",
      icon: Layers
    },
    {
      id: "Monitoring Agent",
      name: "Monitoring Agent",
      subtitle: "Collects metrics and system data from AEGIS nodes.",
      category: "Monitoring",
      version: "1.3.2",
      date: "May 6, 2025",
      status: "Installed" as const,
      compatibility: "v1.3.0+",
      downloads: "4.1K",
      description: "Lightweight daemon agent that gathers system statistics, GPU utilization, memory loads, and temperatures for reporting to the AEGIS Grid.",
      publisher: "AEGIS Foundation",
      license: "Apache-2.0",
      size: "24.5 MB",
      securityStatus: "Verified",
      platforms: ["Linux", "Windows", "macOS"],
      cpu: "1 core",
      ram: "512 MB",
      gpu: "None",
      storage: "50 MB",
      icon: Activity
    },
    {
      id: "Security Scanner",
      name: "Security Scanner",
      subtitle: "Vulnerability scanning for containers and AI models.",
      category: "Security",
      version: "1.1.0",
      date: "May 5, 2025",
      status: "Available" as const,
      compatibility: "v1.0.0+",
      downloads: "3.2K",
      description: "Scans container environments, runtime layers, and deep learning model weights for safety vulnerabilities, prompt injection exploits, and backdoor malware.",
      publisher: "AEGIS Foundation",
      license: "Proprietary",
      size: "180.2 MB",
      securityStatus: "Verified",
      platforms: ["Linux", "Windows"],
      cpu: "2 cores",
      ram: "4 GB",
      gpu: "None",
      storage: "1 GB",
      icon: ShieldCheck
    },
    {
      id: "Model Storage",
      name: "Model Storage",
      subtitle: "Distributed storage for models and datasets.",
      category: "Storage",
      version: "2.0.3",
      date: "May 7, 2025",
      status: "Installed" as const,
      compatibility: "v1.9.0+",
      downloads: "2.8K",
      description: "P2P-backed distributed storage client for sharing model weights and large datasets across nodes with cryptographic integrity checks.",
      publisher: "AEGIS Foundation",
      license: "Apache-2.0",
      size: "88.4 MB",
      securityStatus: "Verified",
      platforms: ["Linux", "Windows", "macOS"],
      cpu: "2 cores",
      ram: "2 GB",
      gpu: "None",
      storage: "50 GB",
      icon: Box
    },
    {
      id: "Python SDK",
      name: "Python SDK",
      subtitle: "Python SDK to interact with AEGIS network and APIs.",
      category: "Developer Tools",
      version: "1.4.1",
      date: "May 3, 2025",
      status: "Installed" as const,
      compatibility: "v1.2.0+",
      downloads: "2.2K",
      description: "Complete Python developer toolkit containing APIs, bindings, utility libraries, and helper classes to build decentralized client applications on AEGIS.",
      publisher: "AEGIS Foundation",
      license: "MIT",
      size: "12.5 MB",
      securityStatus: "Verified",
      platforms: ["Linux", "Windows", "macOS"],
      cpu: "1 core",
      ram: "1 GB",
      gpu: "None",
      storage: "100 MB",
      icon: Terminal
    },
    {
      id: "Data Preprocessor",
      name: "Data Preprocessor",
      subtitle: "Data cleaning and preprocessing toolkit for ML pipelines.",
      category: "Data Processing",
      version: "1.0.2",
      date: "May 2, 2025",
      status: "Available" as const,
      compatibility: "v1.0.0+",
      downloads: "1.9K",
      description: "Fast dataset preprocessing utility that cleans, structures, normalizes, and tokenizes raw inputs for training and batch inference pipelines.",
      publisher: "AEGIS Foundation",
      license: "Apache-2.0",
      size: "64.7 MB",
      securityStatus: "Verified",
      platforms: ["Linux", "Windows", "macOS"],
      cpu: "2 cores",
      ram: "4 GB",
      gpu: "None",
      storage: "200 MB",
      icon: Activity
    }
  ];

  const packages = packagesData.map(pkg => ({
    ...pkg,
    status: localStatuses[pkg.id] || pkg.status
  }));

  const selectedPackage = packages.find(p => p.id === selectedPackageId) || packages[0];

  const handleAction = (packageId: string, nextStatus: "Installed" | "Available" | "Update Available") => {
    setLocalStatuses(prev => ({ ...prev, [packageId]: nextStatus }));
  };

  const totalPackagesCount = 86;
  const installedPackagesCount = packages.filter(p => p.status === "Installed").length + 15;
  const updatesAvailableCount = packages.filter(p => p.status === "Update Available").length + 2;
  const verifiedPackagesCount = 82;

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || pkg.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || pkg.category === categoryFilter;
    const matchesStatus = statusFilter === "All Status" || pkg.status === statusFilter;
    
    if (activeTab === "installed" && pkg.status !== "Installed") return false;
    if (activeTab === "updates" && pkg.status !== "Update Available") return false;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 w-full text-slate-800">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Packages", value: totalPackagesCount.toString(), sub: "Across all categories", icon: Box, color: "text-[#4D7CFE] bg-blue-50 border border-blue-100" },
          { label: "Installed Packages", value: installedPackagesCount.toString(), sub: "On your nodes", icon: CloudDownload, color: "text-emerald-600 bg-emerald-50 border border-emerald-100" },
          { label: "Updates Available", value: updatesAvailableCount.toString(), sub: "Require your attention", icon: ArrowUpCircle, color: "text-amber-600 bg-amber-50 border border-amber-100", dot: "bg-amber-500" },
          { label: "Verified Packages", value: verifiedPackagesCount.toString(), sub: "Security verified", icon: ShieldCheck, color: "text-blue-500 bg-blue-50/50 border border-blue-100" }
        ].map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${stat.color} flex items-center justify-center relative`}>
                {stat.dot && <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${stat.dot}`} />}
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
        
        {/* Left Column - Packages list & filters */}
        <div className={`bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4 ${isDetailsOpen ? "lg:col-span-2" : "lg:col-span-3"}`}>
          
          {/* Table headers */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search packages..." 
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#4D7CFE] transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option>All Categories</option>
                <option>Inference</option>
                <option>Data</option>
                <option>Runtime</option>
                <option>Monitoring</option>
                <option>Security</option>
                <option>Storage</option>
                <option>Developer Tools</option>
                <option>Data Processing</option>
              </select>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option>All Status</option>
                <option>Installed</option>
                <option>Available</option>
                <option>Update Available</option>
              </select>
              <select 
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option>Sort by: Popular</option>
                <option>Sort by: Downloads</option>
                <option>Sort by: Rating</option>
              </select>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex border-b border-slate-100 gap-6 mt-1 text-xs font-extrabold uppercase tracking-wider text-slate-400 font-sans">
            {[
              { id: "all" as const, label: "All Packages" },
              { id: "installed" as const, label: `Installed (${installedPackagesCount})` },
              { id: "updates" as const, label: `Updates (${updatesAvailableCount})` }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? "border-[#4D7CFE] text-slate-900 font-black" 
                    : "border-transparent hover:text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Packages Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] pb-2 font-sans">
                  <th className="pb-2.5">Package</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Version</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Compatibility</th>
                  <th className="pb-2.5">Downloads</th>
                  <th className="pb-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPackages.map((pkg) => {
                  const isSelected = pkg.id === selectedPackageId;
                  const PkgIcon = pkg.icon;
                  return (
                    <tr 
                      key={pkg.id} 
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        setIsDetailsOpen(true);
                      }}
                      className={`hover:bg-slate-50/50 cursor-pointer transition-all ${isSelected ? "bg-slate-50 border-l-4 border-[#4D7CFE]" : ""}`}
                    >
                      <td className="py-3.5 pr-2 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600">
                            <PkgIcon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <div>{pkg.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{pkg.subtitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-2 text-slate-500 font-semibold">{pkg.category}</td>
                      <td className="py-3.5 pr-2 font-mono">{pkg.version}</td>
                      <td className="py-3.5 pr-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                          pkg.status === "Installed" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : pkg.status === "Update Available"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-slate-50 text-slate-500 border border-slate-100"
                        }`}>
                          {pkg.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-slate-500 font-semibold">{pkg.compatibility}</td>
                      <td className="py-3.5 pr-2 text-slate-900 font-bold font-mono">{pkg.downloads}</td>
                      <td className="py-3.5 text-center" onClick={e => e.stopPropagation()}>
                        {pkg.status === "Installed" ? (
                          <button 
                            onClick={() => handleAction(pkg.id, "Available")}
                            className="rounded-xl border border-red-200 hover:bg-red-50 px-3 py-1.5 text-[10px] font-extrabold text-red-500 transition-colors cursor-pointer"
                          >
                            Uninstall
                          </button>
                        ) : pkg.status === "Update Available" ? (
                          <button 
                            onClick={() => handleAction(pkg.id, "Installed")}
                            className="rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-[10px] font-extrabold text-white transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleAction(pkg.id, "Installed")}
                            className="rounded-xl bg-[#4D7CFE] hover:bg-[#3b66d9] px-3 py-1.5 text-[10px] font-extrabold text-white transition-colors cursor-pointer"
                          >
                            Install
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Specs Drawer */}
        {isDetailsOpen && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-5 lg:col-span-1 min-h-[500px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">{selectedPackage.name}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Package specifications and installation guides</p>
              </div>
              <button 
                onClick={() => setIsDetailsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
              {(["overview", "versions", "changelog", "dependencies"] as const).map(tab => (
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
                {/* Description */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Description</span>
                  <p className="text-slate-700 font-medium leading-relaxed text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedPackage.description}</p>
                </div>

                {/* Specs */}
                <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700">
                  <h4 className="font-heading font-extrabold text-slate-900 text-[10px] uppercase tracking-widest border-b border-slate-100 pb-1.5 mt-2">Specifications</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Publisher</span>
                    <span className="text-slate-900 font-bold">{selectedPackage.publisher}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                    <span className="text-slate-400 font-medium">License</span>
                    <span className="text-slate-900 font-bold">{selectedPackage.license}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                    <span className="text-slate-400 font-medium">Package Size</span>
                    <span className="text-slate-900 font-mono font-bold">{selectedPackage.size}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                    <span className="text-slate-400 font-medium">Security Scan</span>
                    <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4" /> {selectedPackage.securityStatus}
                    </span>
                  </div>
                </div>

                {/* Hardware Requirements */}
                <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700">
                  <h4 className="font-heading font-extrabold text-slate-900 text-[10px] uppercase tracking-widest border-b border-slate-100 pb-1.5 mt-2">Requirements</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">CPU Cores</span>
                    <span className="text-slate-900 font-bold">{selectedPackage.cpu}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                    <span className="text-slate-400 font-medium">System RAM</span>
                    <span className="text-slate-900 font-bold">{selectedPackage.ram}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                    <span className="text-slate-400 font-medium">GPU Compute</span>
                    <span className="text-slate-900 font-bold text-right max-w-[130px]">{selectedPackage.gpu}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                    <span className="text-slate-400 font-medium">Disk Space</span>
                    <span className="text-slate-900 font-bold">{selectedPackage.storage}</span>
                  </div>
                </div>
              </div>
            )}

            {detailTab === "versions" && (
              <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700">
                {[
                  { ver: `v${selectedPackage.version} (Latest)`, date: selectedPackage.date, active: true },
                  { ver: "v2.3.9", date: "Apr 28, 2025" },
                  { ver: "v2.3.5", date: "Apr 15, 2025" }
                ].map((v, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className={`font-mono ${v.active ? "text-slate-900 font-bold" : "text-slate-500"}`}>{v.ver}</span>
                    <span className="text-slate-400 font-mono">{v.date}</span>
                  </div>
                ))}
              </div>
            )}

            {detailTab === "changelog" && (
              <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700 leading-relaxed font-sans">
                <p className="font-bold text-slate-900 font-sans">v{selectedPackage.version} Release Notes:</p>
                <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-500 font-sans">
                  <li>Improved multi-threaded performance.</li>
                  <li>Added security verification checksum triggers.</li>
                  <li>Fixed local memory overflow leaks on Node clusters.</li>
                </ul>
              </div>
            )}

            {detailTab === "dependencies" && (
              <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700">
                {[
                  { name: "aegis-core-runtime", ver: ">=v1.2.0", optional: false },
                  { name: "cuda-drivers", ver: ">=v11.8", optional: true }
                ].map((d, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-900 font-bold font-mono">{d.name}</span>
                    <span className="text-slate-500 text-[10px] font-mono">{d.ver} {d.optional && "(Optional)"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
