"use client";

import React, { useState, useEffect } from "react";
import { Users, Globe2, Sparkles, Inbox, Activity, Search, ShieldCheck, PieChart, Layers, ArrowLeft, Lock, Key } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "analytics" | "security">("overview");

  // Password change states
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [securityError, setSecurityError] = useState("");

  // Initialize default password and restore session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aegis_admin_password");
      if (!stored) {
        localStorage.setItem("aegis_admin_password", "admin");
      }
      
      const session = sessionStorage.getItem("aegis_admin_session");
      if (session === "active") {
        setIsLoggedIn(true);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const storedPassword = localStorage.getItem("aegis_admin_password") || "admin";
      if (loginUsername === "admin" && loginPassword === storedPassword) {
        setIsLoggedIn(true);
        setLoginError("");
        sessionStorage.setItem("aegis_admin_session", "active");
      } else {
        setLoginError("Invalid username or password.");
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginUsername("");
    setLoginPassword("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("aegis_admin_session");
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError("");
    setSecuritySuccess("");

    if (typeof window !== "undefined") {
      const storedPassword = localStorage.getItem("aegis_admin_password") || "admin";

      if (currentPasswordInput !== storedPassword) {
        setSecurityError("Current password is incorrect.");
        return;
      }

      if (!newPasswordInput) {
        setSecurityError("New password cannot be empty.");
        return;
      }

      if (newPasswordInput !== confirmPasswordInput) {
        setSecurityError("New passwords do not match.");
        return;
      }

      localStorage.setItem("aegis_admin_password", newPasswordInput);
      setSecuritySuccess("Password updated successfully.");
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
    }
  };

  // Mock analytics data
  interface MetricItem {
    value: string;
    subtext: string;
    icon: React.ComponentType<any>;
  }

  const metrics: Record<string, MetricItem> = {
    visitors: { value: "42,850", subtext: "+14.2% this week", icon: Users },
    countries: { value: "128 countries", subtext: "US 38%, DE 14%, JP 11%, UK 9%", icon: Globe2 },
    members: { value: "2,840 nodes", subtext: "+8.6% growth", icon: Sparkles },
    requests: { value: "42 requests", subtext: "Avg. response time: 2.4 hrs", icon: Inbox }
  };

  const requests = [
    { id: "REQ-01", name: "Dr. Elena Rostova", institution: "Stanford Bio-AI Lab", country: "United States", role: "Researcher", status: "Pending" },
    { id: "REQ-02", name: "Marcus Vance", institution: "Vanguard Capital Partners", country: "United Kingdom", role: "Partner", status: "Reviewing" },
    { id: "REQ-03", name: "Aiko Tanaka", institution: "Tokyo Agritech Systems", country: "Japan", role: "Developer", status: "Approved" },
    { id: "REQ-04", name: "Liam O'Connor", institution: "CERN Compute Cluster", country: "Switzerland", role: "Contributor", status: "Pending" },
    { id: "REQ-05", name: "Zahra Al-Jamil", institution: "Saudi Energy Grid", country: "Saudi Arabia", role: "Partner", status: "Reviewing" }
  ];

  const searchQueries = [
    { query: "Healthcare Agent node specs", count: 840 },
    { query: "Federated LoRA adaptation latency", count: 620 },
    { query: "Consensus state ledger audits", count: 480 },
    { query: "How to register banking nodes", count: 350 },
    { query: "Zero-Knowledge proofs validation", count: 290 }
  ];

  const sectorInterest = [
    { sector: "Healthcare", interestIndex: "94.2%", nodePotential: "240 nodes" },
    { sector: "Banking", interestIndex: "88.6%", nodePotential: "180 nodes" },
    { sector: "Manufacturing", interestIndex: "82.4%", nodePotential: "165 nodes" },
    { sector: "Energy", interestIndex: "79.1%", nodePotential: "130 nodes" },
    { sector: "Agriculture", interestIndex: "74.5%", nodePotential: "90 nodes" }
  ];

  // Render Login Form if unauthorized
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-6 font-body">
        <div className="w-full max-w-md glass-card p-8 border border-white/5 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#4D7CFE] to-[#7DD3FC]" />
          
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-heading font-extrabold text-xl tracking-tight">Access Restricted</h1>
            <p className="text-xs text-gray-500 max-w-xs font-light">
              Enter credentials to authenticate into the AEGIS Operations Dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-heading text-[9px] font-extrabold tracking-widest text-gray-500 uppercase">
                Username
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 focus:border-[#4D7CFE] focus:bg-white/[0.08] text-sm text-white placeholder-gray-600 transition-all outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-heading text-[9px] font-extrabold tracking-widest text-gray-500 uppercase">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 focus:border-[#4D7CFE] focus:bg-white/[0.08] text-sm text-white placeholder-gray-600 transition-all outline-none"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 font-medium text-center mt-1">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="btn-glass w-full py-3 mt-2 text-xs font-heading font-bold tracking-widest text-white hover:bg-gradient-to-r hover:from-[#4D7CFE] hover:to-[#7DD3FC] hover:border-transparent hover:text-white transition-all cursor-pointer"
            >
              AUTHENTICATE
            </button>
          </form>

          <div className="border-t border-white/5 pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to landing page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 font-body selection:bg-[#4D7CFE]/30 selection:text-white">
      <div className="max-w-[80rem] mx-auto flex flex-col gap-10">
        
        {/* Header navigation */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 border border-white/10 rounded-full bg-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-heading font-extrabold text-2xl tracking-tight">AEGIS Operations Dashboard</h1>
              <p className="text-xs text-gray-500 font-light mt-1">Real-time telemetry, node deployment metrics, and request verification logs.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 border border-white/5 bg-white/[0.01] p-1 rounded-xl">
              {(["overview", "requests", "analytics", "security"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-lg text-[10px] font-heading font-bold uppercase transition-all cursor-pointer ${
                    activeTab === tab 
                      ? "bg-[#4D7CFE] text-white shadow-md shadow-[#4D7CFE]/20" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-lg border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-[10px] font-heading font-bold uppercase transition-all cursor-pointer"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* Tab 1: Overview Dashboard */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-10">
            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Object.entries(metrics).map(([key, data]) => {
                const Icon = data.icon;
                return (
                  <div key={key} className="glass-card p-6 flex flex-col gap-4 text-left">
                    <div className="flex justify-between items-center">
                      <span className="font-heading text-[10px] font-extrabold tracking-widest text-gray-500 uppercase">
                        {key}
                      </span>
                      <div className="w-8 h-8 rounded-lg border border-white/5 bg-white/5 flex items-center justify-center text-[#7DD3FC]">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-2xl text-white">
                        {data.value}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-light mt-1.5 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        {data.subtext}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Central charts replacement / Metrics panel grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Node Application Log */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <h2 className="font-heading font-extrabold text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#4D7CFE]" />
                    Recent Node Applications
                  </h2>
                  <button 
                    onClick={() => setActiveTab("requests")} 
                    className="text-xs font-heading font-bold text-[#7DD3FC] hover:text-white uppercase tracking-wider transition-colors"
                  >
                    View All
                  </button>
                </div>
                
                <div className="glass-card overflow-hidden w-full border border-white/5">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="p-4 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">Applicant</th>
                        <th className="p-4 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">Institution</th>
                        <th className="p-4 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">Country</th>
                        <th className="p-4 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="p-4 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.slice(0, 3).map((req) => (
                        <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                          <td className="p-4 text-sm font-semibold text-white">{req.name}</td>
                          <td className="p-4 text-xs text-gray-400 font-light">{req.institution}</td>
                          <td className="p-4 text-xs text-gray-400 font-light">{req.country}</td>
                          <td className="p-4 text-xs text-[#7DD3FC]">{req.role}</td>
                          <td className="p-4 text-xs">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              req.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              req.status === "Reviewing" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              "bg-[#4D7CFE]/10 text-[#7DD3FC] border border-[#4D7CFE]/20"
                            }`}>
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Engagement Metric Quickcard */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                <h2 className="font-heading font-extrabold text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#7DD3FC]" />
                  Engagement Metrics
                </h2>
                <div className="glass-card p-6 flex flex-col gap-6 text-left">
                  <div>
                    <span className="font-heading text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Avg. Session Duration
                    </span>
                    <h4 className="font-heading font-extrabold text-xl text-white">4 min 12 sec</h4>
                    <p className="text-[10px] text-gray-500 font-light mt-0.5">Benchmarked against linear SaaS portals</p>
                  </div>
                  <div>
                    <span className="font-heading text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Platform Bounce Rate
                    </span>
                    <h4 className="font-heading font-extrabold text-xl text-white">22.4%</h4>
                    <p className="text-[10px] text-gray-500 font-light mt-0.5">High initial retention index</p>
                  </div>
                  <div>
                    <span className="font-heading text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      Global Interaction Heatmap
                    </span>
                    <div className="h-8 w-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg opacity-85 border border-white/5 mt-2 flex items-center justify-between px-3 text-[9px] font-heading font-extrabold text-white">
                      <span>HIGH LOAD</span>
                      <span>NOMINAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Join Requests detail */}
        {activeTab === "requests" && (
          <div className="flex flex-col gap-5 text-left">
            <h2 className="font-heading font-extrabold text-lg">Active Node Verification Queue</h2>
            <div className="glass-card overflow-hidden border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="p-4 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="p-4 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="p-4 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">Institution</th>
                    <th className="p-4 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="p-4 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="p-4 font-heading text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                      <td className="p-4 text-xs font-semibold text-gray-400">{req.id}</td>
                      <td className="p-4 text-sm font-semibold text-white">{req.name}</td>
                      <td className="p-4 text-xs text-gray-400 font-light">{req.institution}</td>
                      <td className="p-4 text-xs text-gray-400 font-light">{req.country}</td>
                      <td className="p-4 text-xs text-[#7DD3FC]">{req.role}</td>
                      <td className="p-4 text-xs">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          req.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          req.status === "Reviewing" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-[#4D7CFE]/10 text-[#7DD3FC] border border-[#4D7CFE]/20"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Detailed Analytics */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            
            {/* Search Queries Analytics */}
            <div className="flex flex-col gap-4">
              <h2 className="font-heading font-extrabold text-lg flex items-center gap-2">
                <Search className="w-5 h-5 text-[#4D7CFE]" />
                Spotlight Search Queries (⌘K)
              </h2>
              <div className="glass-card p-6 flex flex-col gap-4">
                {searchQueries.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-semibold text-gray-300 font-heading">
                      "{item.query}"
                    </span>
                    <span className="text-xs text-[#7DD3FC] font-semibold">
                      {item.count} searches
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sector Interest Analytics */}
            <div className="flex flex-col gap-4">
              <h2 className="font-heading font-extrabold text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#7DD3FC]" />
                Sector Interest Analytics
              </h2>
              <div className="glass-card p-6 flex flex-col gap-4">
                {sectorInterest.map((sec, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-semibold text-white">
                      {sec.sector}
                    </span>
                    <div className="flex gap-4 text-xs font-light text-gray-400">
                      <span>Rate: <strong className="text-[#7DD3FC]">{sec.interestIndex}</strong></span>
                      <span>Target: <strong>{sec.nodePotential}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Security Settings (Change Password) */}
        {activeTab === "security" && (
          <div className="max-w-md mx-auto w-full flex flex-col gap-5 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-lg">Dashboard Security</h2>
                <p className="text-xs text-gray-500 font-light mt-0.5">Update the admin account access password.</p>
              </div>
            </div>

            <div className="glass-card p-6 border border-white/5 relative overflow-hidden mt-2">
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-[9px] font-extrabold tracking-widest text-gray-500 uppercase">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 focus:border-[#4D7CFE] focus:bg-white/[0.08] text-sm text-white placeholder-gray-600 transition-all outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-[9px] font-extrabold tracking-widest text-gray-500 uppercase">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 focus:border-[#4D7CFE] focus:bg-white/[0.08] text-sm text-white placeholder-gray-600 transition-all outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-[9px] font-extrabold tracking-widest text-gray-500 uppercase">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 focus:border-[#4D7CFE] focus:bg-white/[0.08] text-sm text-white placeholder-gray-600 transition-all outline-none"
                    required
                  />
                </div>

                {securityError && (
                  <p className="text-xs text-red-400 font-medium">
                    {securityError}
                  </p>
                )}

                {securitySuccess && (
                  <p className="text-xs text-emerald-400 font-medium">
                    {securitySuccess}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-glass w-full py-3 mt-2 text-xs font-heading font-bold tracking-widest text-white hover:bg-gradient-to-r hover:from-[#4D7CFE] hover:to-[#7DD3FC] hover:border-transparent hover:text-white transition-all cursor-pointer"
                >
                  UPDATE PASSWORD
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
