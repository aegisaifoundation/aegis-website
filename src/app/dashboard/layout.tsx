"use client";

import { useDashboard, DashboardProvider, WorkflowType } from "./DashboardContext";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home, Server, FileText, ShoppingBag, ArrowDownToLine, Activity, CreditCard, Headphones, Settings,
  Bell, Command, X, LogOut, ChevronDown, ShieldCheck, Shield, KeyRound, Layers, ArrowRight,
  Download, Bot, Database, MessageSquare, BookOpen, Building2, WalletCards, Cpu, CircleEllipsis, PackageOpen, CloudDownload
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DashboardProvider>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    profile,
    loading,
    error,
    handleLogout,
    openWorkflow,
    activeWorkflow,
    setActiveWorkflow,
    nodeName,
    setNodeName,
    nodeLocation,
    setNodeLocation,
    gpuSpecs,
    setGpuSpecs,
    regLoading,
    regError,
    regSuccess,
    handleRegisterNode
  } = useDashboard();

  const [commandOpen, setCommandOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Command palette hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050812] text-white flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-3">
          <Cpu className="w-8 h-8 text-[#7DD3FC] animate-spin" />
          <span className="text-xs text-slate-500 font-mono tracking-wider">Synchronizing secure session...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#050812] text-white flex flex-col items-center justify-center gap-4 font-body">
        <div className="text-sm text-red-300 border border-red-500/20 bg-red-500/10 px-6 py-4 rounded-xl max-w-sm text-center">
          {error || "Access Denied."}
        </div>
        <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-white underline cursor-pointer">
          Return to Login
        </button>
      </div>
    );
  }

  // Active view routing path mapping
  const getActiveView = () => {
    if (pathname === "/dashboard") return "dashboard";
    return pathname.replace("/dashboard/", "");
  };
  const activeView = getActiveView();

  const navigation = [
    { id: "dashboard", label: "Overview", icon: Home, href: "/dashboard" },
    { id: "my-nodes", label: "My Nodes", icon: Server, href: "/dashboard/my-nodes" },
    { id: "requests", label: "Requests", icon: FileText, href: "/dashboard/requests" },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag, href: "/dashboard/marketplace" },
    { id: "downloads", label: "Downloads", icon: ArrowDownToLine, href: "/dashboard/downloads" },
    { id: "usage", label: "Usage", icon: Activity, href: "/dashboard/usage" },
    { id: "billing", label: "Billing", icon: CreditCard, href: "/dashboard/billing" },
    { id: "support", label: "Support", icon: Headphones, href: "/dashboard/support" },
    { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ] as const;

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-body flex">
      {/* Dark Sidebar Left */}
      <aside className="w-64 bg-[#0B0F19] text-white shrink-0 flex flex-col justify-between py-6 border-r border-white/5 select-none z-20 h-full overflow-y-auto">
        <div className="flex flex-col gap-7">
          <Link href="/" className="flex items-center gap-3 px-6">
            <img src="/assets/logo.png" alt="AEGIS Logo" className="w-6 h-6 object-contain" />
            <span className="font-heading text-lg font-extrabold tracking-wider text-white">AEGIS</span>
          </Link>

          <nav className="flex flex-col gap-1 px-4 text-xs font-semibold">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                    active 
                      ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] font-semibold" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${active ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile and Logout Box */}
        <div className="px-4 flex flex-col gap-2">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-800 text-white font-heading font-bold text-xs border border-white/[0.08]">
              OP
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">Operator</p>
              <p className="text-[10px] text-slate-400 truncate">{profile.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 text-slate-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Right */}
      <section className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] h-full overflow-y-auto">
        {/* Header */}
        {activeView !== "support" && (
          <header className="flex justify-between items-center px-8 py-5 border-b border-slate-200/60 bg-white">
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight capitalize">
                {activeView === "dashboard" ? "Overview" : activeView.replace("-", " ")}
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium font-sans">
                {activeView === "dashboard" && "Welcome back, Operator. Here's what's happening with your AEGIS network."}
                {activeView === "settings" && "Manage your operator settings and application security parameters."}
                {activeView === "my-nodes" && "Register, inspect, and connect local GPU infrastructure."}
                {activeView === "requests" && "Manage approval pipelines with comments, attachments, reviewer context, and activity history."}
                {activeView === "marketplace" && "Featured, verified, partner, and community components for AI deployment workflows."}
                {activeView === "downloads" && "Search components, compare versions, inspect requirements, and request secure access."}
                {activeView === "usage" && "Monitor and analyze your resource consumption across all nodes."}
                {activeView === "billing" && "Compare plans, billing settings, GST tax invoices, and account subscriptions."}
                {activeView === "support" && "Create support tickets, open live chat, report bugs, request features, and check system status."}
              </p>
            </div>

            <div className="flex items-center gap-4.5">
              <button 
                onClick={() => router.push("/dashboard/settings")}
                className="relative p-1.5 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <Bell className="h-5 w-5" />
              </button>

              <button 
                onClick={() => router.push("/dashboard/settings")}
                className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 bg-slate-100/85 hover:bg-slate-200/60 rounded-full border border-slate-200/40 text-slate-700 transition-colors cursor-pointer text-xs font-bold font-sans"
              >
                <span className="grid h-6.5 w-6.5 place-items-center rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
                  OP
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>
          </header>
        )}

        {/* Content Pane */}
        <div className={`flex-1 ${activeView === "support" ? "" : "p-10"}`}>
          {children}
        </div>
      </section>

      {/* Command Palette & Dialogs */}
      {commandOpen && (
        <CommandPalette
          query={globalQuery}
          setQuery={setGlobalQuery}
          onClose={() => setCommandOpen(false)}
          onSelectView={(view) => {
            router.push(view === "dashboard" ? "/dashboard" : `/dashboard/${view}`);
            setCommandOpen(false);
          }}
          onOpenWorkflow={openWorkflow}
        />
      )}
      {activeWorkflow && <WorkflowModal workflow={activeWorkflow} onClose={() => setActiveWorkflow(null)} />}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-md relative flex flex-col gap-4">
            <button 
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <form onSubmit={handleRegisterNode} className="flex flex-col gap-4">
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 text-lg uppercase tracking-wider">Register Compute Node</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Submit your local hardware specifications for validation.</p>
              </div>
              <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700">
                <label className="flex flex-col gap-1.5">
                  <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Node Name</span>
                  <input 
                    type="text" 
                    value={nodeName} 
                    onChange={e => setNodeName(e.target.value)} 
                    placeholder="e.g. AEGIS-NODE-04" 
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-[#4D7CFE] transition-colors"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Location</span>
                  <input 
                    type="text" 
                    value={nodeLocation} 
                    onChange={e => setNodeLocation(e.target.value)} 
                    placeholder="e.g. United States (New York)" 
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-[#4D7CFE] transition-colors"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">GPU Specs / Capabilities</span>
                  <input 
                    type="text" 
                    value={gpuSpecs} 
                    onChange={e => setGpuSpecs(e.target.value)} 
                    placeholder="e.g. NVIDIA RTX 4090, 24 GB VRAM" 
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-[#4D7CFE] transition-colors"
                    required
                  />
                </label>
              </div>
              <button 
                type="submit" 
                disabled={regLoading}
                className="w-full text-center rounded-xl bg-[#4D7CFE] hover:bg-[#3b66d9] text-white py-3 text-xs font-bold transition-all cursor-pointer disabled:bg-slate-300"
              >
                {regLoading ? "Submitting..." : "Submit Registration Request"}
              </button>
              {regError && <p className="text-xs text-red-500 font-medium">{regError}</p>}
              {regSuccess && <p className="text-xs text-emerald-600 font-medium">{regSuccess}</p>}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function CommandPalette({
  query,
  setQuery,
  onClose,
  onSelectView,
  onOpenWorkflow,
}: {
  query: string;
  setQuery: (query: string) => void;
  onClose: () => void;
  onSelectView: (view: any) => void;
  onOpenWorkflow: (workflow: WorkflowType) => void;
}) {
  const pages = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "my-nodes", label: "My Nodes", icon: Cpu },
    { id: "requests", label: "Request Center", icon: CircleEllipsis },
    { id: "marketplace", label: "Marketplace", icon: PackageOpen },
    { id: "downloads", label: "Downloads", icon: CloudDownload },
    { id: "usage", label: "Usage", icon: Activity },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "support", label: "Help Center", icon: Headphones },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  const filtered = pages.filter((page) => page.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-40 bg-black/60 px-4 py-20 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.08] bg-[#0d111a] p-3 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <label className="flex items-center gap-3 border-b border-white/[0.08] px-3 py-3">
          <Command className="h-5 w-5 text-violet-300" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search pages, downloads, API keys, documentation, commands..." />
          <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-white/[0.06] hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </label>
        <div className="max-h-[420px] overflow-y-auto py-2">
          <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 font-sans">Pages</p>
          {filtered.map((page) => {
            const Icon = page.icon;
            return (
              <button key={`${page.id}-${page.label}`} onClick={() => onSelectView(page.id)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-slate-300 hover:bg-white/[0.055] hover:text-white cursor-pointer">
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-violet-300" />
                  {page.label}
                </span>
                <ArrowRight className="h-4 w-4 stroke-slate-600" />
              </button>
            );
          })}
          <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 font-sans">Commands</p>
          {[
            { label: "Generate API Key", workflow: "api-key" as WorkflowType, icon: KeyRound },
            { label: "Create Download Request", workflow: "request" as WorkflowType, icon: CloudDownload },
            { label: "Open Support Ticket", workflow: "support" as WorkflowType, icon: Headphones },
          ].map((command) => {
            const Icon = command.icon;
            return (
              <button key={command.label} onClick={() => onOpenWorkflow(command.workflow)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-300 hover:bg-white/[0.055] hover:text-white cursor-pointer">
                <Icon className="h-4 w-4 text-violet-300" />
                {command.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WorkflowModal({ workflow, onClose }: { workflow: WorkflowType; onClose: () => void }) {
  const copy: Record<WorkflowType, { title: string; description: string; fields: string[]; primary: string; icon: React.ComponentType<{ className?: string }> }> = {
    "api-key": {
      title: "Generate API Key",
      description: "Choose environment, scopes, expiration, and restrictions before creating a credential.",
      fields: ["Key name", "Environment", "Permissions", "Expiration", "IP restrictions"],
      primary: "Generate key",
      icon: KeyRound,
    },
    download: {
      title: "Download Component",
      description: "Select version, platform, architecture, license, and integrity verification options.",
      fields: ["Component", "Version", "Platform", "Architecture", "Install command"],
      primary: "Prepare download",
      icon: Download,
    },
    request: {
      title: "Create Request",
      description: "Submit a request with organization context, approval reason, attachments, and priority.",
      fields: ["Request type", "Organization", "Justification", "Priority", "Attachments"],
      primary: "Submit request",
      icon: CircleEllipsis,
    },
    upgrade: {
      title: "Upgrade Plan",
      description: "Compare plans, review limits, select billing cycle, and confirm payment details.",
      fields: ["Plan", "Billing cycle", "Seats", "Payment method", "Tax details"],
      primary: "Continue",
      icon: WalletCards,
    },
    support: {
      title: "Create Support Ticket",
      description: "Route issues to the right team with logs, screenshots, severity, and contact preferences.",
      fields: ["Subject", "Category", "Severity", "Description", "Attachments"],
      primary: "Create ticket",
      icon: Headphones,
    },
    organization: {
      title: "Create Organization",
      description: "Set up a team workspace with members, roles, billing, and security defaults.",
      fields: ["Organization name", "Domain", "Role", "Members", "Workspace defaults"],
      primary: "Create organization",
      icon: Building2,
    },
    project: {
      title: "Create Project",
      description: "Create a project for downloads, API keys, models, requests, and deployments.",
      fields: ["Project name", "Workspace", "Environment", "Owner", "Template"],
      primary: "Create project",
      icon: Layers,
    },
    agent: {
      title: "Create Agent",
      description: "Configure an intelligent agent with runtime, tools, permissions, and deployment target.",
      fields: ["Agent name", "Runtime", "Tools", "Permissions", "Deployment"],
      primary: "Create agent",
      icon: Bot,
    },
    danger: {
      title: "Security Confirmation",
      description: "Review sensitive security changes before they affect sessions, tokens, or credentials.",
      fields: ["Action", "Verification", "Recovery option", "Audit reason", "Confirmation"],
      primary: "Confirm securely",
      icon: Shield,
    },
  };
  const detail = copy[workflow];
  const Icon = detail.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 px-4 py-10 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto max-w-xl rounded-3xl border border-white/[0.08] bg-[#0d111a] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-200">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold text-white">{detail.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400 font-sans">{detail.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {detail.fields.map((field) => (
            <label key={field} className="block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500 font-sans">{field}</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/60" placeholder={field} />
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.05] cursor-pointer">Cancel</button>
          <button onClick={onClose} className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-400 cursor-pointer">{detail.primary}</button>
        </div>
      </div>
    </div>
  );
}
