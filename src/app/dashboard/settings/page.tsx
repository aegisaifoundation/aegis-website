"use client";

import { useDashboard } from "../DashboardContext";
import {
  User, Shield, Lock, Bell, ChevronDown, Check, KeyRound, Monitor, ShieldCheck
} from "lucide-react";

export default function SettingsPage() {
  const {
    profile,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passError,
    passSuccess,
    passLoading,
    handlePasswordChange,
    settingsTab,
    setSettingsTab
  } = useDashboard();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start text-slate-800">
      {/* Left Column (Settings subtabs navigation menu) */}
      <div className="lg:col-span-1 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-1.5 font-semibold text-xs text-slate-500">
        <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-sans">Settings Catalog</p>
        {[
          { id: "profile", label: "Operator Profile", icon: User },
          { id: "security", label: "Change Password", icon: Lock },
          { id: "keys", label: "API Credentials", icon: KeyRound },
          { id: "preferences", label: "Preferences", icon: Monitor }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const active = settingsTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
                active 
                  ? "bg-slate-50 text-slate-900 shadow-[inset_0_1px_0_rgba(0,0,0,0.02)] border-l-4 border-[#4D7CFE]" 
                  : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
              }`}
            >
              <TabIcon className={`h-4.5 w-4.5 ${active ? "text-[#4D7CFE]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Column (Forms content pane) */}
      <div className="lg:col-span-3 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col gap-6">
        
        {settingsTab === "profile" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-base uppercase tracking-wider">Operator Profile</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Verify or update your organization membership details.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-semibold text-xs text-slate-700">
              <label className="flex flex-col gap-1.5">
                <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Email Address</span>
                <input 
                  type="text" 
                  value={profile?.email || ""} 
                  disabled 
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none text-slate-500 cursor-not-allowed font-medium font-sans"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Operator ID</span>
                <input 
                  type="text" 
                  value={profile?.userId || ""} 
                  disabled 
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none text-slate-500 cursor-not-allowed font-mono"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Role Hierarchy</span>
                <input 
                  type="text" 
                  value={profile?.role || ""} 
                  disabled 
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none text-slate-500 cursor-not-allowed uppercase font-bold tracking-wider"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Grid Session Status</span>
                <input 
                  type="text" 
                  value={profile?.status || ""} 
                  disabled 
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none text-slate-500 cursor-not-allowed uppercase font-bold tracking-wider"
                />
              </label>
            </div>
          </div>
        )}

        {settingsTab === "security" && (
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-6">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-base uppercase tracking-wider">Change Operator Password</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Reauthenticate and supply a new password for security rotation.</p>
            </div>

            <div className="flex flex-col gap-4 font-semibold text-xs text-slate-700 max-w-md">
              <label className="flex flex-col gap-1.5">
                <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Current Password</span>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-[#4D7CFE] transition-colors"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">New Password</span>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-[#4D7CFE] transition-colors"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Confirm New Password</span>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-[#4D7CFE] transition-colors"
                  required
                />
              </label>
            </div>

            <button 
              type="submit" 
              disabled={passLoading}
              className="w-fit rounded-xl bg-[#4D7CFE] hover:bg-[#3b66d9] text-white px-6 py-3 text-xs font-bold transition-all cursor-pointer disabled:bg-slate-300"
            >
              {passLoading ? "Updating..." : "Rotate Password Key"}
            </button>

            {passError && <p className="text-xs text-red-500 font-semibold leading-normal font-sans">{passError}</p>}
            {passSuccess && <p className="text-xs text-emerald-600 font-semibold leading-normal font-sans">{passSuccess}</p>}
          </form>
        )}

        {settingsTab === "keys" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-base uppercase tracking-wider font-sans">API Keys & Credentials</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Local CLI integration secrets.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-3 justify-between max-w-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 shrink-0">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">aegis_cli_prod_token</h4>
                  <p className="text-[9px] font-mono text-slate-400 mt-0.5">Expires on Jun 12, 2027</p>
                </div>
              </div>
              <span className="text-[8px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider font-sans">Active</span>
            </div>
          </div>
        )}

        {settingsTab === "preferences" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-base uppercase tracking-wider">Workspace Preferences</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Configure layout notifications and reporting bounds.</p>
            </div>
            
            <div className="flex flex-col gap-3 font-semibold text-xs text-slate-700 max-w-md">
              <label className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-[#4D7CFE] border-slate-300 rounded" />
                <div>
                  <p className="text-slate-950 font-bold leading-none font-sans">Email Notifications</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 font-sans">Receive email alerts when node heartbeat goes offline.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-[#4D7CFE] border-slate-300 rounded" />
                <div>
                  <p className="text-slate-950 font-bold leading-none font-sans">Secure Telemetry</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 font-sans">Share anonymized GPU statistics for node network optimization.</p>
                </div>
              </label>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
