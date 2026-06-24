"use client";

import { useEffect, useState } from "react";
import { Terminal, Cpu, Database, RefreshCw, Radio, HardDrive, Play, Zap, ShieldAlert, LineChart } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, addDoc, query, orderBy, limit } from "firebase/firestore";
import { getOrCreateUserProfile, UserProfile } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";

interface DiagnosticsLog {
  id: string;
  server: string;
  service: string;
  action: string;
  status: "Completed" | "Pending" | "Failed";
  operator: string;
  timestamp: number;
}

export default function TechDivisionHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Diagnostics & system status
  const [logs, setLogs] = useState<DiagnosticsLog[]>([]);
  const [targetServer, setTargetServer] = useState("aegis-core-gpu-01");
  const [targetService, setTargetService] = useState("Federated Learning Node");
  const [maintAction, setMaintAction] = useState("Reboot Container");
  const [executingAction, setExecutingAction] = useState(false);

  // Mock server stats that animate/fluctuate
  const [latency, setLatency] = useState(24);
  const [cpuUsage, setCpuUsage] = useState(62);
  const [memoryUsage, setMemoryUsage] = useState(48);
  const [dbConnections, setDbConnections] = useState(142);
  const [cacheStatus, setCacheStatus] = useState("Optimized");

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

  // Fluctuating stats for premium micro-animation feel
  useEffect(() => {
    const timer = setInterval(() => {
      setLatency((prev) => Math.max(12, Math.min(80, prev + Math.floor(Math.random() * 9) - 4)));
      setCpuUsage((prev) => Math.max(20, Math.min(95, prev + Math.floor(Math.random() * 11) - 5)));
      setMemoryUsage((prev) => Math.max(30, Math.min(90, prev + Math.floor(Math.random() * 5) - 2)));
      setDbConnections((prev) => Math.max(100, Math.min(250, prev + Math.floor(Math.random() * 7) - 3)));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Sync Diagnostics Logs
  useEffect(() => {
    const q = query(collection(db, "diagnostic_logs"), orderBy("timestamp", "desc"), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: DiagnosticsLog[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as DiagnosticsLog);
      });
      setLogs(list);
    }, (err) => console.error("Diagnostic logs sync failed:", err));

    return unsubscribe;
  }, []);

  const handleCacheFlush = async () => {
    if (!profile) return;
    setCacheStatus("Flushing...");
    try {
      await logActivity("CACHE_FLUSH", "Initiated global Edge cache purge.");
      await addNotification("TECH", "Edge CDN Cache Flushed by system developer.");
      
      // Simulate cache reset write
      const diagRef = collection(db, "diagnostic_logs");
      await addDoc(diagRef, {
        server: "aegis-edge-cdn-gateway",
        service: "Nginx Cache Server",
        action: "Global Cache Flush",
        status: "Completed",
        operator: profile.email,
        timestamp: Date.now()
      });

      setTimeout(() => {
        setCacheStatus("Optimized");
        alert("Edge Content Delivery Network cache purged successfully.");
      }, 1000);
    } catch (err: any) {
      setCacheStatus("Optimized");
      alert("Cache flush failed: " + err.message);
    }
  };

  const handleRunDiagnostics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setExecutingAction(true);

    try {
      const diagData = {
        server: targetServer,
        service: targetService,
        action: maintAction,
        status: "Completed" as const,
        operator: profile.email,
        timestamp: Date.now()
      };

      await addDoc(collection(db, "diagnostic_logs"), diagData);
      await logActivity("SERVER_MAINTENANCE", `Maintenance action [${maintAction}] run on [${targetServer}] - Service: [${targetService}]`);
      await addNotification("TECH", `Server action triggered on ${targetServer}: ${maintAction}`);

      alert(`Maintenance task dispatch confirmed: ${maintAction} successfully executed.`);
    } catch (err: any) {
      alert("Failed to execute maintenance task: " + err.message);
    } finally {
      setExecutingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-gray-500 animate-pulse">
        Initializing Tech & AI Division Telemetry module...
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-10 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-amber-950/20 to-black overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Terminal className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl tracking-wide text-white uppercase">
              Tech & AI Division Hub
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Real-time engineering portal. SREs, ML Engineers, and Developers can flush cache, trigger maintenance, and audit live hardware telemetry.
            </p>
          </div>
        </div>
        
        {/* Cache Flush action */}
        <button
          onClick={handleCacheFlush}
          disabled={cacheStatus === "Flushing..."}
          className="flex items-center gap-2 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/40 hover:bg-white/5 px-5 py-3 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${cacheStatus === "Flushing..." ? "animate-spin" : ""}`} />
          <span>{cacheStatus === "Flushing..." ? "FLUSHING EDGE..." : "PURGE EDGE CACHE"}</span>
        </button>
      </div>

      {/* Grid: Server Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Gateway Latency</span>
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-white">{latency}</span>
            <span className="text-xs text-gray-500">ms</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${Math.max(10, Math.min(100, 100 - (latency - 12) * 1.5))}%` }} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">GPU Cluster Load</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-white">{cpuUsage}</span>
            <span className="text-xs text-gray-500">%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${cpuUsage > 80 ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${cpuUsage}%` }} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">RAM Provisioning</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-white">{memoryUsage}</span>
            <span className="text-xs text-gray-500">%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: `${memoryUsage}%` }} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">DB Connection Pool</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-white">{dbConnections}</span>
            <span className="text-xs text-gray-500">active</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: `${(dbConnections / 250) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Run Maintenance Form */}
        <form onSubmit={handleRunDiagnostics} className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
          <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-amber-400" /> Trigger Server Action
          </h2>
          <p className="text-[10px] text-gray-400">
            Execute maintenance directives directly on nodes register endpoints.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Target Node/Server</label>
            <select
              value={targetServer}
              onChange={(e) => setTargetServer(e.target.value)}
              className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-amber-500 text-xs text-gray-300"
            >
              <option value="aegis-core-gpu-01">aegis-core-gpu-01 (Primary Cluster)</option>
              <option value="aegis-llm-shards-02">aegis-llm-shards-02 (Text Inference)</option>
              <option value="aegis-auth-sec-01">aegis-auth-sec-01 (Identity Vault)</option>
              <option value="aegis-edge-cdn-gateway">aegis-edge-cdn-gateway (Global CDN)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Active System Service</label>
            <select
              value={targetService}
              onChange={(e) => setTargetService(e.target.value)}
              className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-amber-500 text-xs text-gray-300"
            >
              <option value="Federated Learning Node">Federated Learning Node</option>
              <option value="LLM Router & Guardrails">LLM Router & Guardrails</option>
              <option value="CDN Nginx Cache Pool">CDN Nginx Cache Pool</option>
              <option value="Telemetry Daemon V2">Telemetry Daemon V2</option>
              <option value="GraphQL API Resolver">GraphQL API Resolver</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Maintenance Operation</label>
            <select
              value={maintAction}
              onChange={(e) => setMaintAction(e.target.value)}
              className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-amber-500 text-xs text-gray-300"
            >
              <option value="Reboot Container">Reboot Container</option>
              <option value="Deploy Hotfix Patch">Deploy Hotfix Patch</option>
              <option value="Calibrate Sensor Weights">Calibrate Sensor Weights</option>
              <option value="Reset Database Connection Pool">Reset DB Connection Pool</option>
              <option value="Toggle Maintenance Mode">Toggle Maintenance Mode</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={executingAction}
            className="rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] mt-2 cursor-pointer text-black"
          >
            {executingAction ? "EXECUTING DIRECTIVE..." : "RUN MAINTENANCE TASK"}
          </button>
        </form>

        {/* Diagnostics & Operations logs */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Maintenance & Diagnostics Logs
            </h2>
            <LineChart className="w-4 h-4 text-gray-500" />
          </div>

          <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                No telemetry diagnostics logs in registry.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2 text-xs font-mono">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <span className="text-white font-bold">{log.server}</span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      {log.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-400">
                    <div>Service: <strong className="text-gray-200">{log.service}</strong></div>
                    <div>Action: <strong className="text-amber-400 font-semibold">{log.action}</strong></div>
                    <div>Operator: <strong className="text-gray-200">{log.operator.split("@")[0]}</strong></div>
                    <div>Time: <strong className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</strong></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
