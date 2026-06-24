"use client";

import { useState, useEffect } from "react";
import { AlertOctagon, Bell, BellOff, CheckCircle2, ShieldAlert, RefreshCw, Radio } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { logActivity } from "@/config/activityLogger";

interface SystemAlert {
  id: string;
  title: string;
  source: string;
  category: "node_disconnect" | "latency_spike" | "security_auth_fail";
  severity: "critical" | "warning";
  status: "active" | "acknowledged" | "suppressed";
  timestamp: number;
  timeString: string;
}

export default function AdminAlertsManager() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync Alerts from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "system_alerts"), (snapshot) => {
      const list: SystemAlert[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as SystemAlert);
      });

      list.sort((a, b) => b.timestamp - a.timestamp);
      setAlerts(list);
      setLoading(false);
    }, (err) => {
      console.error("Alerts list sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSimulateAlert = async () => {
    try {
      const id = `alert-${Date.now()}`;
      const item: SystemAlert = {
        id,
        title: "WARNING: Suspicious Auth Attempt detected",
        source: "Hashed IP: 195.14.2.14 - 3 invalid keys sent",
        category: "security_auth_fail",
        severity: "warning",
        status: "active",
        timestamp: Date.now(),
        timeString: new Date().toLocaleTimeString(),
      };

      await setDoc(doc(db, "system_alerts", id), item);
      alert("Mock alert trigger injected successfully. Watch the board update!");
      await logActivity("SIMULATE_ALERT_TRIGGER", "Injected mock warning alert to test system monitors.");
    } catch (err: any) {
      alert("Failed to trigger mock alert: " + err.message);
    }
  };

  const handleAcknowledgeAlert = async (id: string, title: string) => {
    try {
      await updateDoc(doc(db, "system_alerts", id), { status: "acknowledged" });
      await logActivity("ACKNOWLEDGE_ALERT", `Acknowledged system warning: ${title}`);
    } catch (err: any) {
      alert("Failed to acknowledge: " + err.message);
    }
  };

  const handleSuppressAlert = async (id: string, title: string) => {
    try {
      await updateDoc(doc(db, "system_alerts", id), { status: "suppressed" });
      await logActivity("SUPPRESS_ALERT", `Suppressed system warning: ${title}`);
    } catch (err: any) {
      alert("Failed to suppress: " + err.message);
    }
  };

  const handleDeleteAlert = async (id: string, title: string) => {
    if (confirm(`Permanently delete alert entry: "${title}"?`)) {
      try {
        await deleteDoc(doc(db, "system_alerts", id));
        await logActivity("DELETE_ALERT_ENTRY", `Deleted alert log entry: ${title}`);
      } catch (err: any) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const getSeverityStyle = (severity: string) => {
    return severity === "critical" 
      ? "bg-red-500/10 text-red-400 border-red-500/20" 
      : "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
      acknowledged: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      suppressed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };
    return styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 font-body">
      {/* Header */}
      <header className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl">Incident & Alert Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Audit active security triggers, acknowledge telemetry alerts, and test warning system routes.</p>
        </div>
        <button
          onClick={handleSimulateAlert}
          className="flex items-center justify-center gap-2 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 text-xs font-semibold rounded-lg px-4 py-2.5 transition-all text-red-400 cursor-pointer"
        >
          <Radio className="w-4 h-4 text-red-500 animate-ping" /> INJECT TEST WARNING ALERT
        </button>
      </header>

      {/* Alerts Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-red-400 shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight text-red-400">
              {alerts.filter(a=>a.status==="active" && a.severity==="critical").length}
            </span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Critical Incidents</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight text-amber-400">
              {alerts.filter(a=>a.status==="active" && a.severity==="warning").length}
            </span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">System Warnings</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight text-emerald-400">
              {alerts.filter(a=>a.status==="acknowledged").length}
            </span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Acknowledged Logs</span>
          </div>
        </div>
      </div>

      {/* Incidents Board */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30">
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            <h2 className="font-heading font-bold text-lg">Active Incident Warnings Board</h2>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing incident boards...</div>
        ) : alerts.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3 text-gray-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <p className="text-sm">All operations nominal. No active incident warnings registered.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {alerts.map((a) => (
              <div 
                key={a.id}
                className="glass-card p-5 rounded-xl border border-white/5 bg-[#030712]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block border text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getSeverityStyle(a.severity)}`}>
                      {a.severity}
                    </span>
                    <span className={`inline-block border text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getStatusBadge(a.status)}`}>
                      {a.status}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">{a.timeString}</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm mt-1">{a.title}</h3>
                  <p className="text-xs text-gray-400 leading-normal font-light">Target Source: {a.source}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  {a.status === "active" && (
                    <button
                      onClick={() => handleAcknowledgeAlert(a.id, a.title)}
                      className="text-emerald-400 hover:text-emerald-300 text-xs border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                  {a.status !== "suppressed" && (
                    <button
                      onClick={() => handleSuppressAlert(a.id, a.title)}
                      className="text-gray-400 hover:text-white text-xs border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Suppress
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAlert(a.id, a.title)}
                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete alert log"
                  >
                    <BellOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
