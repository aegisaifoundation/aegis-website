"use client";

import { useEffect, useState } from "react";
import { Lock, ShieldAlert, Key, Plus, Trash2, Check, AlertOctagon, HelpCircle, Eye, EyeOff, ShieldCheck, FileText } from "lucide-react";
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

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  details: string;
  time: string;
  timestamp: number;
}

export default function SecurityComplianceHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"credentials" | "incidents" | "audits">("credentials");

  // Tokens, Alerts, Logs lists
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActivityLog[]>([]);
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

  // Sync Access Activity Logs
  useEffect(() => {
    const q = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(25));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ActivityLog[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ActivityLog);
      });
      setAuditLogs(list);
    }, (err) => console.error("Activity logs sync failed:", err));

    return unsubscribe;
  }, []);

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setGenerating(true);

    try {
      const keyId = `key_${Date.now()}`;
      const mockKey = `ag_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      
      await setDoc(doc(db, "api_tokens", keyId), {
        name: tokenName.trim(),
        key: mockKey,
        scope: tokenScope,
        createdBy: profile.email,
        createdAt: new Date().toISOString()
      });

      await logActivity("GENERATE_API_TOKEN", `Generated API key for ${tokenName} [Scope: ${tokenScope}]`);
      await addNotification("SECURITY", `API Key Generated: ${tokenName}`);

      setTokenName("");
      alert("Token generated.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeToken = async (id: string, name: string) => {
    if (confirm(`Revoke API authorization token "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "api_tokens", id));
        await logActivity("REVOKE_API_TOKEN", `Revoked API key: ${name}`);
      } catch (err: any) {
        alert("Failed: " + err.message);
      }
    }
  };

  const handleTriggerAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !alertMsg.trim()) return;
    setTriggering(true);

    try {
      await addDoc(collection(db, "system_alerts"), {
        severity: alertSeverity,
        message: alertMsg.trim(),
        status: "Active" as const,
        timestamp: Date.now()
      });

      await logActivity("TRIGGER_SECURITY_ALERT", `Security Alert [${alertSeverity}] Broadcast: "${alertMsg}"`);
      await addNotification("SECURITY", `SECURITY WARNING [${alertSeverity}]: ${alertMsg}`);

      setAlertMsg("");
      alert("System security alert warning broadcast.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setTriggering(false);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await deleteDoc(doc(db, "system_alerts", id));
      await logActivity("RESOLVE_SECURITY_ALERT", `Resolved security alert ${id}`);
    } catch (err: any) {
      alert("Failed: " + err.message);
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
              Cryptographic tokens, active breach warnings, and real-time administrative access logs console.
            </p>
          </div>
        </div>

        {/* Sub-Tab Controls */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0 font-body">
          <button
            onClick={() => setActiveSubTab("credentials")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === "credentials" ? "bg-teal-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Key className="w-3.5 h-3.5" /> API Credentials
          </button>
          <button
            onClick={() => setActiveSubTab("incidents")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === "incidents" ? "bg-teal-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" /> Incident Feed ({alerts.length})
          </button>
          <button
            onClick={() => setActiveSubTab("audits")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === "audits" ? "bg-teal-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Access Audits
          </button>
        </div>
      </div>

      {/* Tab Content: Credentials */}
      {activeSubTab === "credentials" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <form onSubmit={handleGenerateToken} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-teal-400" /> Generate Token
              </h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Credential Token Name</label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="e.g. inference-node-auth"
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Scope Authorization</label>
                <select
                  value={tokenScope}
                  onChange={(e) => setTokenScope(e.target.value)}
                  className="rounded bg-[#030712] border border-white/10 px-3 py-2 text-xs text-gray-300 outline-none"
                >
                  <option value="Read Only">Read Only Telemetry</option>
                  <option value="Node Operator write">Write Node Heartbeats</option>
                  <option value="Full Admin Gateway">Full Admin Access</option>
                </select>
              </div>
              <button type="submit" disabled={generating} className="rounded bg-teal-500 hover:bg-teal-600 text-black py-2.5 text-xs font-bold transition-all cursor-pointer">
                {generating ? "GENERATING..." : "GENERATE"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2 font-body">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> API Credentials Registry
            </h2>
            <div className="flex flex-col gap-3">
              {tokens.map((t) => (
                <div key={t.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="text-white block font-heading font-body">{t.name}</strong>
                    <button onClick={() => handleRevokeToken(t.id, t.name)} className="text-red-400 hover:text-red-300 font-bold cursor-pointer font-body">Revoke</button>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded overflow-hidden select-all text-[10px]">
                    <span>{showKeys[t.id] ? t.key : `${t.key.substring(0, 12)}...•••••••••••`}</span>
                    <button onClick={() => toggleShowKey(t.id)} className="ml-auto text-gray-500 hover:text-white">
                      {showKeys[t.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex justify-between text-[8px] text-gray-500">
                    <span>Scope: {t.scope}</span>
                    <span>By: {t.createdBy.split("@")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Incident Feed */}
      {activeSubTab === "incidents" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <form onSubmit={handleTriggerAlert} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-400" /> Simulate Alert Incident
              </h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Severity</label>
                <select
                  value={alertSeverity}
                  onChange={(e) => setAlertSeverity(e.target.value as any)}
                  className="rounded bg-[#030712] border border-white/10 px-3 py-2 text-xs text-gray-300 outline-none"
                >
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Breach">Breach</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Simulated Message</label>
                <input
                  type="text"
                  value={alertMsg}
                  onChange={(e) => setAlertMsg(e.target.value)}
                  placeholder="SSH connection detected outside VPN..."
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>
              <button type="submit" disabled={triggering} className="rounded bg-orange-500 hover:bg-orange-600 text-black py-2.5 text-xs font-bold transition-all cursor-pointer">
                {triggering ? "DISPATCHING..." : "DISPATCH ALERT"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2 font-body">
              <AlertOctagon className="w-4 h-4 text-orange-400" /> Incident Warning Feed
            </h2>
            <div className="flex flex-col gap-3">
              {alerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">No active incidents.</div>
              ) : (
                alerts.map((al) => (
                  <div key={al.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getAlertSeverityColor(al.severity)}`}>
                        {al.severity}
                      </span>
                      <button onClick={() => handleResolveAlert(al.id)} className="text-[9px] text-[#7DD3FC] hover:text-white font-bold font-body cursor-pointer">Resolve</button>
                    </div>
                    <p className="text-[11px] text-gray-300">{al.message}</p>
                    <div className="text-[8px] text-gray-500 text-right">{new Date(al.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Access Audits */}
      {activeSubTab === "audits" && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6 max-w-4xl mx-auto w-full font-mono text-xs">
          <div>
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2 font-body">
              <ShieldCheck className="w-5 h-5 text-teal-400" /> Security Access audit logs
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">Immutable session triggers recorded directly by authentication enclaves.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-[10px] uppercase font-bold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-teal-400">{log.action}</td>
                    <td className="py-3 px-4 text-gray-300">{log.user}</td>
                    <td className="py-3 px-4 text-gray-400 font-light max-w-xs truncate" title={log.details}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
