"use client";

import { useDashboard, DashboardProvider, WorkflowType } from "./DashboardContext";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Home, Server, FileText, ShoppingBag, ArrowDownToLine, Activity, CreditCard, Headphones, Settings,
  Bell, Command, X, LogOut, ChevronDown, Shield, KeyRound, Layers, ArrowRight,
  Download, Bot, Database, Building2, WalletCards, Cpu, CircleEllipsis, PackageOpen,
  CloudDownload, Globe, User, Search
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-3">
          <Cpu className="w-8 h-8 text-white/40 animate-spin" />
          <span className="text-xs text-white/30 font-mono tracking-wider">Synchronizing secure session...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4 font-body">
        <div className="text-sm text-red-300 border border-red-500/20 bg-red-500/10 px-6 py-4 rounded-xl max-w-sm text-center">
          {error || "Access Denied."}
        </div>
        <button onClick={handleLogout} className="text-xs text-white/30 hover:text-white underline cursor-pointer">
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
  const isDashboardHome = activeView === "dashboard";

  const navGroups = [
    {
      label: "WORKSPACE",
      items: [
        { id: "dashboard", label: "Home", icon: Home, href: "/dashboard" },
        { id: "my-nodes", label: "My Nodes", icon: Server, href: "/dashboard/my-nodes" },
        { id: "requests", label: "Requests", icon: FileText, href: "/dashboard/requests" },
        { id: "marketplace", label: "Marketplace", icon: ShoppingBag, href: "/dashboard/marketplace" },
        { id: "downloads", label: "Downloads", icon: ArrowDownToLine, href: "/dashboard/downloads" },
      ]
    },
    {
      label: "ANALYTICS",
      items: [
        { id: "usage", label: "Usage", icon: Activity, href: "/dashboard/usage" },
        { id: "billing", label: "Billing", icon: CreditCard, href: "/dashboard/billing" },
      ]
    },
    {
      label: "SUPPORT",
      items: [
        { id: "support", label: "Support", icon: Headphones, href: "/dashboard/support" },
      ]
    },
    {
      label: "SYSTEM",
      items: [
        { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
      ]
    },
  ];

  const quickNavItems = [
    { id: "my-nodes", label: "My Nodes", icon: Server, href: "/dashboard/my-nodes" },
    { id: "requests", label: "Requests", icon: FileText, href: "/dashboard/requests" },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag, href: "/dashboard/marketplace" },
    { id: "usage", label: "Usage", icon: Activity, href: "/dashboard/usage" },
  ];

  // User initials
  const initials = profile.email
    ? profile.email.substring(0, 2).toUpperCase()
    : "OP";

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#111111] text-white font-body flex">
      {/* Dark Sidebar */}
      <aside className="w-52 bg-[#111111] shrink-0 flex flex-col justify-between py-5 border-r border-white/[0.06] select-none z-20 h-full overflow-y-auto">
        {/* Logo */}
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2.5 px-5">
            <img src="/assets/logo1.png" alt="AEGIS" className="h-6 object-contain" />
            <span className="font-heading text-base font-bold tracking-widest text-white">AEGIS</span>
          </Link>

          {/* Grouped Nav */}
          <nav className="flex flex-col gap-5 px-3">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-0.5">
                <p className="text-[9px] font-bold tracking-widest text-white/25 uppercase px-2 mb-1">{group.label}</p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeView === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/40 hover:bg-white/5 hover:text-white/70"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-white/40"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Back to Website */}
        <div className="px-3 mt-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-white/40 hover:bg-white/5 hover:text-white/70 transition-all border border-white/[0.06]"
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span>Back to Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Panel */}
      <section className="flex-1 flex flex-col min-w-0 bg-[#111111] h-full overflow-y-auto">
        {/* Top Bar */}
        <header className={`flex justify-between items-center px-8 py-4 ${isDashboardHome ? "" : "border-b border-white/[0.05]"}`}>
          {!isDashboardHome ? (
            <div>
              <h1 className="font-heading font-extrabold text-xl md:text-2xl text-white tracking-tight capitalize">
                {activeView === "dashboard" ? "Overview" : activeView.replace(/-/g, " ")}
              </h1>
              <p className="text-xs text-white/40 mt-0.5 font-medium font-sans">
                {activeView === "settings" && "Manage your operator settings and application security parameters."}
                {activeView === "my-nodes" && "View and manage your AI compute nodes."}
                {activeView === "requests" && "Track, monitor and manage requests across the AEGIS network."}
                {activeView === "marketplace" && "Discover and install intelligence, tools and packages for your AEGIS network."}
                {activeView === "downloads" && "Search components, compare versions, inspect requirements, and request secure access."}
                {activeView === "usage" && "Monitor and analyze your resource consumption across all nodes."}
                {activeView === "billing" && "Compare plans, billing settings, GST tax invoices, and account subscriptions."}
              </p>
            </div>
          ) : <div />}

          <div className="flex items-center gap-3">
            {/* Bell */}
            <button
              onClick={() => router.push("/dashboard/settings")}
              className="p-2 text-white/30 hover:text-white/70 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
            >
              <Bell className="h-4.5 w-4.5" />
            </button>

            {/* User dropdown trigger */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] transition-colors cursor-pointer"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#2a2a2a] text-white font-bold text-[11px] border border-white/10">
                  {initials}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-white">Operator</span>
                  <span className="text-[10px] text-white/40">{profile.email}</span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-white/30 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-[#1a1a1a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50 py-1">
                  <button
                    onClick={() => { router.push("/dashboard/settings"); setUserMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <User className="h-4 w-4 text-white/30" />
                    Account
                  </button>
                  <button
                    onClick={() => { router.push("/dashboard/settings"); setUserMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Shield className="h-4 w-4 text-white/30" />
                    Security
                  </button>
                  <button
                    onClick={() => { router.push("/dashboard/settings"); setUserMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Settings className="h-4 w-4 text-white/30" />
                    Preferences
                  </button>
                  <div className="border-t border-white/[0.06] my-1" />
                  <button
                    onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-white/30" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        {isDashboardHome ? (
          /* Centered Dashboard Home */
          <div className="flex-1 flex flex-col items-center justify-between px-4 pt-12 pb-8 h-full">
            {/* Main Upper Content Block */}
            <div className="flex flex-col items-center gap-8 w-full max-w-xl mt-4">
              {/* Logo + Name */}
              <div className="flex flex-col items-center gap-3">
                <img src="/assets/logo1.png" alt="AEGIS" className="h-24 w-24 object-contain opacity-95" />
                <h1 className="text-3xl font-bold text-white tracking-tight">Operator</h1>
                <p className="text-sm text-white/40">{profile.email}</p>
              </div>

              {/* Search Bar */}
              <div className="w-full max-w-md">
                <label className="flex items-center gap-3 bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 focus-within:border-white/20 transition-colors cursor-pointer">
                  <Search className="h-4 w-4 text-white/25 shrink-0" />
                  <input
                    placeholder="Search AEGIS"
                    className="bg-transparent text-sm text-white/70 placeholder:text-white/25 outline-none flex-1 cursor-pointer"
                    onClick={() => setCommandOpen(true)}
                    onFocus={() => setCommandOpen(true)}
                    readOnly
                  />
                </label>
              </div>

              {/* Quick Nav Pills */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {quickNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-2.5 px-4 py-2.5 bg-[#1c1c1c] hover:bg-[#252525] border border-white/[0.07] rounded-xl text-sm font-medium text-white/60 hover:text-white transition-all"
                    >
                      <Icon className="h-4 w-4 text-white/30" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Privacy Note Pinned to Bottom */}
            <div className="flex items-center gap-2 text-white/30 text-xs mt-auto pt-10">
              <Shield className="h-3.5 w-3.5 shrink-0 text-white/40" />
              <span>Your AEGIS data and settings are private and secure.</span>
              <button onClick={() => router.push("/dashboard/settings")} className="text-white/50 hover:text-white font-medium underline transition-colors cursor-pointer">Learn more</button>
            </div>
          </div>
        ) : (
          /* Sub-page layout */
          <div className={`flex-1 ${activeView === "support" ? "" : "p-10"}`}>
            {/* Sub-page header */}
            {activeView !== "support" && activeView !== "my-nodes" && activeView !== "requests" && activeView !== "marketplace" && (
              <div className="mb-8">
                <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight capitalize">
                  {activeView.replace(/-/g, " ")}
                </h1>
                <p className="text-xs text-white/35 mt-1 font-medium font-sans">
                  {activeView === "settings" && "Manage your operator settings and application security parameters."}
                  {activeView === "my-nodes" && "Register, inspect, and connect local GPU infrastructure."}
                  {activeView === "requests" && "Manage approval pipelines with comments, attachments, and activity history."}
                  {activeView === "marketplace" && "Featured, verified, partner, and community components for AI deployment workflows."}
                  {activeView === "downloads" && "Search components, compare versions, inspect requirements, and request secure access."}
                  {activeView === "usage" && "Monitor and analyze your resource consumption across all nodes."}
                  {activeView === "billing" && "Compare plans, billing settings, GST tax invoices, and account subscriptions."}
                </p>
              </div>
            )}
            {children}
          </div>
        )}
      </section>

      {/* Command Palette */}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-white/[0.08] rounded-3xl p-6 shadow-xl w-full max-w-md relative flex flex-col gap-4">
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <form onSubmit={handleRegisterNode} className="flex flex-col gap-4">
              <div>
                <h3 className="font-heading font-extrabold text-white text-lg uppercase tracking-wider">Register Compute Node</h3>
                <p className="text-xs text-white/40 font-medium mt-1">Submit your local hardware specifications for validation.</p>
              </div>
              <div className="flex flex-col gap-3 font-semibold text-xs text-white/70">
                <label className="flex flex-col gap-1.5">
                  <span className="text-white/30 uppercase tracking-widest text-[9px] font-bold">Node Name</span>
                  <input
                    type="text"
                    value={nodeName}
                    onChange={e => setNodeName(e.target.value)}
                    placeholder="e.g. AEGIS-NODE-04"
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-white outline-none focus:border-white/20 transition-colors placeholder:text-white/20"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-white/30 uppercase tracking-widest text-[9px] font-bold">Location</span>
                  <input
                    type="text"
                    value={nodeLocation}
                    onChange={e => setNodeLocation(e.target.value)}
                    placeholder="e.g. United States (New York)"
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-white outline-none focus:border-white/20 transition-colors placeholder:text-white/20"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-white/30 uppercase tracking-widest text-[9px] font-bold">GPU Specs / Capabilities</span>
                  <input
                    type="text"
                    value={gpuSpecs}
                    onChange={e => setGpuSpecs(e.target.value)}
                    placeholder="e.g. NVIDIA RTX 4090, 24 GB VRAM"
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-white outline-none focus:border-white/20 transition-colors placeholder:text-white/20"
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={regLoading}
                className="w-full text-center rounded-xl bg-white text-black py-3 text-xs font-bold transition-all cursor-pointer hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40"
              >
                {regLoading ? "Submitting..." : "Submit Registration Request"}
              </button>
              {regError && <p className="text-xs text-red-400 font-medium">{regError}</p>}
              {regSuccess && <p className="text-xs text-emerald-400 font-medium">{regSuccess}</p>}
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
    <div className="fixed inset-0 z-40 bg-black/70 px-4 py-20 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.08] bg-[#161616] p-3 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <label className="flex items-center gap-3 border-b border-white/[0.06] px-3 py-3">
          <Search className="h-4.5 w-4.5 text-white/30" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20" placeholder="Search pages, downloads, API keys, documentation, commands..." />
          <button onClick={onClose} className="rounded-lg p-1 text-white/30 hover:bg-white/[0.06] hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </label>
        <div className="max-h-[420px] overflow-y-auto py-2">
          <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-white/25 font-sans">Pages</p>
          {filtered.map((page) => {
            const Icon = page.icon;
            return (
              <button key={`${page.id}-${page.label}`} onClick={() => onSelectView(page.id)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-white/50 hover:bg-white/[0.055] hover:text-white cursor-pointer">
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-white/30" />
                  {page.label}
                </span>
                <ArrowRight className="h-4 w-4 text-white/20" />
              </button>
            );
          })}
          <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-white/25 font-sans">Commands</p>
          {[
            { label: "Generate API Key", workflow: "api-key" as WorkflowType, icon: KeyRound },
            { label: "Create Download Request", workflow: "request" as WorkflowType, icon: CloudDownload },
            { label: "Open Support Ticket", workflow: "support" as WorkflowType, icon: Headphones },
          ].map((command) => {
            const Icon = command.icon;
            return (
              <button key={command.label} onClick={() => onOpenWorkflow(command.workflow)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white/50 hover:bg-white/[0.055] hover:text-white cursor-pointer">
                <Icon className="h-4 w-4 text-white/30" />
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
    <div className="fixed inset-0 z-50 bg-black/70 px-4 py-10 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto max-w-xl rounded-3xl border border-white/[0.08] bg-[#161616] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-white/50">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold text-white">{detail.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/40 font-sans">{detail.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-white/30 hover:bg-white/[0.06] hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {detail.fields.map((field) => (
            <label key={field} className="block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-white/30 font-sans">{field}</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/20" placeholder={field} />
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-white/50 hover:bg-white/[0.05] hover:text-white cursor-pointer">Cancel</button>
          <button onClick={onClose} className="rounded-xl bg-white text-black px-4 py-3 text-sm font-medium hover:bg-white/90 cursor-pointer">{detail.primary}</button>
        </div>
      </div>
    </div>
  );
}
