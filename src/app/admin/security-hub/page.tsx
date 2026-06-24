"use client";

import { useEffect, useState } from "react";
import { Lock, ShieldAlert, Key, Plus, Trash2, Check, AlertOctagon, HelpCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, query, orderBy, limit } from "firebase/firestore";
import { getOrCreateUserProfile, UserProfile } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";

interface ApiToken {
  id: string;
  name: string;
  key: string;
  scope: string;
  createdBy: string;
  createdAt: string;
}

interface SystemAlert {
  id: string;
  severity: "Info" | "Warning" | "Breach";
  message: string;
  status: "Active" | "Resolved";
  timestamp: number;
}

export default function SecurityComplianceHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Tokens & Alerts lists
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [showKeys, setShowKeys] = useState<{ [id: string]: boolean }>({});

  // Token creation form state
  const [tokenName, setTokenName] = useState("");
  const [tokenScope, setTokenScope] = useState("Read Only");
  const [generating, setGenerating] = useState(false);

  // Alert simulation state
  const [alertSeverity, setAlertSeverity] = useState<"Info" | "Warning" | "Breach">("Warning");
  const [alertMsg, setAlertMsg] = useState("");
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const prof = await getOrCreateUserProfile(user.uid, user.email || "");
          setProfile(prof);
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sync API Tokens
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "api_tokens"), (snapshot) => {
      const list: ApiToken[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ApiToken);
      });
      setTokens(list);
    }, (err) => console.error("API tokens sync failed:", err));

    return unsubscribe;
  }, []);

  // Sync System Alerts
  useEffect(() => {
    const q = query(collection(db, "system_alerts"), orderBy("timestamp", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: SystemAlert[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as SystemAlert);
      });
      setAlerts(list);
    }, (err) => console.error("System alerts sync failed:", err));

    return unsubscribe;
  }, []);

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setGenerating(true);

    try {
      const keyId = `key_${Date.now()}`;
      const mockKey = `ag_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      
      const tokenData = {
        name: tokenName.trim(),
        key: mockKey,
        scope: tokenScope,
        createdBy: profile.email,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "api_tokens", keyId), tokenData);
      await logActivity("GENERATE_API_TOKEN", `Generated API key for ${tokenName} with scope ${tokenScope}`);
      await addNotification("SECURITY", `New API authorization credential key generated for: ${tokenName}`);

      setTokenName("");
      alert("API authorization token generated successfully.");
    } catch (err: any) {
      alert("Failed to generate token: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeToken = async (id: string, name: string) => {
    if (confirm(`Revoke API authorization token "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "api_tokens", id));
        await logActivity("REVOKE_API_TOKEN", `Revoked API authorization key for ${name}`);
        alert("API Token revoked successfully.");
      } catch (err: any) {
        alert("Failed to revoke token: " + err.message);
      }
    }
  };

  const handleTriggerAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !alertMsg.trim()) return;
    setTriggering(true);

    try {
      const alertData = {
        severity: alertSeverity,
        message: alertMsg.trim(),
        status: "Active" as const,
        timestamp: Date.now()
      };

      await addDoc(collection(db, "system_alerts"), alertData);
      await logActivity("TRIGGER_SECURITY_ALERT", `Security Alert [${alertSeverity}] Broadcast: "${alertMsg}"`);
      await addNotification("SECURITY", `SECURITY WARNING [${alertSeverity}]: ${alertMsg}`);

      setAlertMsg("");
      alert("System security alert warning broadcast dispatched.");
    } catch (err: any) {
      alert("Failed to dispatch alert warning: " + err.message);
    } finally {
      setTriggering(false);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await deleteDoc(doc(db, "system_alerts", id));
      await logActivity("RESOLVE_SECURITY_ALERT", `Security Alert resolved.`);
    } catch (err: any) {
      alert("Failed to resolve alert: " + err.message);
    }
  };

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "Breach": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Warning": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-gray-500 animate-pulse">
        Mounting Security & Auditing Cryptographic module...
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-10 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-teal-950/20 to-black overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl tracking-wide text-white uppercase">
              Cybersecurity & Compliance Hub
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Audit operational logs, generate cryptographic access tokens, simulate security breach alerts warnings, and monitor firewall telemetry parameters.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: API Keys Generator Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form onSubmit={handleGenerateToken} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-400" /> Generate Access Token
            </h2>
            <p className="text-[10px] text-gray-400">
              Provision credential endpoints for backend pipelines or developer tools.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Credential Token Name</label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="e.g. telemetry-node-exporter"
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-teal-500 text-xs text-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Authorization Scope</label>
              <select
                value={tokenScope}
                onChange={(e) => setTokenScope(e.target.value)}
                className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-teal-500 text-xs text-gray-300"
              >
                <option value="Read Only">Read (Telemetry Metrics Only)</option>
                <option value="Node Operator write">Write (Node Operator Heartbeats)</option>
                <option value="Full Admin Gateway">Full (Admin Database Control)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="rounded-lg bg-teal-500 hover:bg-teal-600 disabled:bg-gray-700 py-2.5 text-xs font-bold transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)] mt-2 cursor-pointer text-black"
            >
              {generating ? "GENERATING KEY..." : "GENERATE SECURE KEY"}
            </button>
          </form>

          {/* Alert Warning Simulator */}
          <form onSubmit={handleTriggerAlert} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" /> Security Alert Simulator
            </h2>
            <p className="text-[10px] text-gray-400">
              Trigger simulated incident parameters. Active alerts warnings are visible globally.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Severity Level</label>
              <select
                value={alertSeverity}
                onChange={(e) => setAlertSeverity(e.target.value as any)}
                className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-teal-500 text-xs text-gray-300"
              >
                <option value="Info">Info (Status Check Alert)</option>
                <option value="Warning">Warning (Node Disconnection Alert)</option>
                <option value="Breach">Breach (Unauthorized Access Alert)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Simulated Message</label>
              <input
                type="text"
                value={alertMsg}
                onChange={(e) => setAlertMsg(e.target.value)}
                placeholder="e.g. Port 22 SSH connection detected outside VPN scope."
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-teal-500 text-xs text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={triggering}
              className="rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 py-2.5 text-xs font-bold transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] mt-2 cursor-pointer text-black"
            >
              {triggering ? "DISPATCHING WARNING..." : "TRIGGER SYSTEM WARNING"}
            </button>
          </form>
        </div>

        {/* Right Columns: API Token List & Live Alerts Feed */}
        <div className="lg:col-span-7 flex flex-col gap-6 font-mono text-xs">
          {/* Active Tokens Registry */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2 font-body">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> Active API Credentials Registry
            </h2>

            <div className="flex flex-col gap-3">
              {tokens.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  No api tokens registered.
                </div>
              ) : (
                tokens.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-xs font-heading font-body">{t.name}</span>
                      <button
                        onClick={() => handleRevokeToken(t.id, t.name)}
                        className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 hover:border-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded px-3 py-1.5 select-all overflow-hidden text-[10px] text-gray-300">
                      <span>{showKeys[t.id] ? t.key : `${t.key.substring(0, 12)}...•••••••••••`}</span>
                      <button 
                        onClick={() => toggleShowKey(t.id)} 
                        className="ml-auto text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {showKeys[t.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[8px] text-gray-500">
                      <span>Scope: <strong className="text-teal-400">{t.scope}</strong></span>
                      <span>By: {t.createdBy.split("@")[0]}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Warnings Feed */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2 font-body">
              <AlertOctagon className="w-4 h-4 text-orange-400" /> Live System Incidents Alert Log
            </h2>

            <div className="flex flex-col gap-3">
              {alerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  No active warnings detected in system log.
                </div>
              ) : (
                alerts.map((al) => (
                  <div key={al.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-2">
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getAlertSeverityColor(al.severity)}`}>
                        {al.severity} Severity
                      </span>
                      <button
                        onClick={() => handleResolveAlert(al.id)}
                        className="text-[9px] text-[#7DD3FC] hover:text-white transition-colors font-bold font-body cursor-pointer"
                      >
                        RESOLVE WARNING
                      </button>
                    </div>
                    
                    <p className="text-[10px] text-gray-300 leading-relaxed">{al.message}</p>

                    <div className="text-[8px] text-gray-500 text-right">
                      {new Date(al.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
