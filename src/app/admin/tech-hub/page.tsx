"use client";

import { useEffect, useState } from "react";
import { Terminal, Cpu, Database, RefreshCw, Radio, HardDrive, Play, Zap, LineChart, Award, Plus, Trash2, Sliders } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
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

interface ModelCheckpoint {
  id: string;
  name: string;
  version: string;
  loss: number;
  parameters: string;
  registeredBy: string;
  timestamp: number;
}

export default function TechDivisionHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"diagnostics" | "maintenance" | "weights">("diagnostics");

  // Diagnostics & maintenance actions state
  const [logs, setLogs] = useState<DiagnosticsLog[]>([]);
  const [targetServer, setTargetServer] = useState("aegis-core-gpu-01");
  const [targetService, setTargetService] = useState("Federated Learning Node");
  const [maintAction, setMaintAction] = useState("Reboot Container");
  const [executingAction, setExecutingAction] = useState(false);

  // Model weights checkpoints state
  const [checkpoints, setCheckpoints] = useState<ModelCheckpoint[]>([]);
  const [modelName, setModelName] = useState("");
  const [modelVersion, setModelVersion] = useState("v1.0.0");
  const [modelLoss, setModelLoss] = useState(0.015);
  const [modelParams, setModelParams] = useState("8B parameters");
  const [registeringModel, setRegisteringModel] = useState(false);

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

  // Sync AI Weights Checkpoints
  useEffect(() => {
    const q = query(collection(db, "model_checkpoints"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ModelCheckpoint[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ModelCheckpoint);
      });
      setCheckpoints(list);
    }, (err) => console.error("Model checkpoints sync failed:", err));

    return unsubscribe;
  }, []);

  const handleCacheFlush = async () => {
    if (!profile) return;
    setCacheStatus("Flushing...");
    try {
      await logActivity("CACHE_FLUSH", "Purged Edge CDN cache.");
      await addNotification("TECH", "Edge Cache Flushed by engineering team.");
      
      await addDoc(collection(db, "diagnostic_logs"), {
        server: "aegis-edge-cdn-gateway",
        service: "Nginx Cache Server",
        action: "Global Cache Flush",
        status: "Completed",
        operator: profile.email,
        timestamp: Date.now()
      });

      setTimeout(() => {
        setCacheStatus("Optimized");
        alert("CDN Edge Cache purged successfully.");
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
      await addDoc(collection(db, "diagnostic_logs"), {
        server: targetServer,
        service: targetService,
        action: maintAction,
        status: "Completed" as const,
        operator: profile.email,
        timestamp: Date.now()
      });

      await logActivity("SERVER_MAINTENANCE", `Maintenance: ${maintAction} run on ${targetServer}`);
      await addNotification("TECH", `Server action run on ${targetServer}: ${maintAction}`);
      alert("Maintenance operation completed successfully.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setExecutingAction(false);
    }
  };

  const handleRegisterModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setRegisteringModel(true);

    try {
      const id = `checkpoint-${Date.now()}`;
      await setDoc(doc(db, "model_checkpoints", id), {
        id,
        name: modelName.trim(),
        version: modelVersion.trim(),
        loss: Number(modelLoss),
        parameters: modelParams.trim(),
        registeredBy: profile.email,
        timestamp: Date.now()
      });

      await logActivity("REGISTER_MODEL_CHECKPOINT", `Registered AI weights model checkpoint ${modelName} (${modelVersion})`);
      await addNotification("AI", `New model weights checkpoint registered: ${modelName} [${modelVersion}]`);

      setModelName("");
      alert("AI weights model checkpoint registered successfully.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setRegisteringModel(false);
    }
  };

  const handleDeleteModel = async (id: string, name: string) => {
    if (confirm(`Remove weights checkpoint "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "model_checkpoints", id));
        await logActivity("DELETE_MODEL_CHECKPOINT", `Deleted weights checkpoint ${name}`);
      } catch (err: any) {
        alert("Failed to delete checkpoint: " + err.message);
      }
    }
  };

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
              Systems logs and weights checkpoints console. Flush Edge caches, trigger container reboots, and register AI weights indices.
            </p>
          </div>
        </div>

        {/* Sub-Tab Controls */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0 font-body">
          <button
            onClick={() => setActiveSubTab("diagnostics")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === "diagnostics" ? "bg-amber-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Telemetry
          </button>
          <button
            onClick={() => setActiveSubTab("maintenance")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === "maintenance" ? "bg-amber-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Maintenance
          </button>
          <button
            onClick={() => setActiveSubTab("weights")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === "weights" ? "bg-amber-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> AI Weights
          </button>
        </div>
      </div>

      {/* Tab Content: Diagnostics */}
      {activeSubTab === "diagnostics" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Edge Gateway Latency</span>
              <div className="text-2xl font-bold font-heading text-white">{latency} ms</div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${Math.max(10, Math.min(100, 100 - (latency - 12) * 1.5))}%` }} />
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">GPU Cluster Load</span>
              <div className="text-2xl font-bold font-heading text-white">{cpuUsage} %</div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${cpuUsage}%` }} />
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Node Memory Load</span>
              <div className="text-2xl font-bold font-heading text-white">{memoryUsage} %</div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: `${memoryUsage}%` }} />
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">DB Streams pool</span>
              <div className="text-2xl font-bold font-heading text-white">{dbConnections} active</div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: `${(dbConnections / 250) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs max-w-3xl mx-auto w-full">
            <div className="flex justify-between items-center font-body mb-2 border-b border-white/5 pb-2">
              <h2 className="font-heading font-bold text-sm text-white">Edge CDN Diagnostics status</h2>
              <button onClick={handleCacheFlush} disabled={cacheStatus === "Flushing..."} className="text-[10px] text-amber-400 font-bold uppercase tracking-wider cursor-pointer">
                {cacheStatus === "Flushing..." ? "Purging Edge..." : "Purge CDN Cache"}
              </button>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>CDN Routing Integrity:</span>
              <span className="text-emerald-400 font-bold">Secure</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Cache PURGE Endpoint:</span>
              <span className="text-[#7DD3FC]">{cacheStatus}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Maintenance Logs */}
      {activeSubTab === "maintenance" && (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <form onSubmit={handleRunDiagnostics} className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-amber-400" /> Trigger Node Action
            </h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Target Node/Server</label>
              <select
                value={targetServer}
                onChange={(e) => setTargetServer(e.target.value)}
                className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none"
              >
                <option value="aegis-core-gpu-01">aegis-core-gpu-01</option>
                <option value="aegis-llm-shards-02">aegis-llm-shards-02</option>
                <option value="aegis-auth-sec-01">aegis-auth-sec-01</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Service Daemon</label>
              <select
                value={targetService}
                onChange={(e) => setTargetService(e.target.value)}
                className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none"
              >
                <option value="Federated Learning Node">Federated Learning Node</option>
                <option value="LLM Router & Guardrails">LLM Router & Guardrails</option>
                <option value="CDN Nginx Cache Pool">CDN Nginx Cache Pool</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Operation Action</label>
              <select
                value={maintAction}
                onChange={(e) => setMaintAction(e.target.value)}
                className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none"
              >
                <option value="Reboot Container">Reboot Container</option>
                <option value="Deploy Hotfix Patch">Deploy Hotfix Patch</option>
                <option value="Reset Database Connection Pool">Reset DB Pool</option>
              </select>
            </div>
            <button type="submit" disabled={executingAction} className="rounded bg-amber-500 hover:bg-amber-600 text-black py-2.5 text-xs font-bold transition-all cursor-pointer">
              {executingAction ? "EXECUTING..." : "RUN TASK"}
            </button>
          </form>

          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs">
            <h2 className="font-heading font-bold text-sm text-white flex items-center gap-2 font-body">
              <Zap className="w-4 h-4 text-amber-400" /> Operational Diagnostics Logs
            </h2>
            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white font-bold">{log.server}</span>
                    <span className="text-emerald-400">{log.status}</span>
                  </div>
                  <div className="text-[9px] text-gray-500">Service: {log.service} | Action: <span className="text-amber-400">{log.action}</span></div>
                  <div className="text-[9px] text-gray-500 text-right">By: {log.operator.split("@")[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: AI Weights */}
      {activeSubTab === "weights" && (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <form onSubmit={handleRegisterModel} className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Log Weight Checkpoint
            </h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Model Name</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. aegis-core-llama3-lora"
                className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Version tag</label>
                <input
                  type="text"
                  value={modelVersion}
                  onChange={(e) => setModelVersion(e.target.value)}
                  placeholder="v1.0.0"
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Evaluation Loss</label>
                <input
                  type="number"
                  step="0.001"
                  value={modelLoss}
                  onChange={(e) => setModelLoss(Number(e.target.value))}
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Parameters count</label>
              <input
                type="text"
                value={modelParams}
                onChange={(e) => setModelParams(e.target.value)}
                placeholder="e.g. 8B parameters"
                className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                required
              />
            </div>
            <button type="submit" disabled={registeringModel} className="rounded bg-amber-500 hover:bg-amber-600 text-black py-2.5 text-xs font-bold transition-all cursor-pointer">
              {registeringModel ? "REGISTERING..." : "REGISTER CHECKPOINT"}
            </button>
          </form>

          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs">
            <h2 className="font-heading font-bold text-sm text-white flex items-center gap-2 font-body">
              <Award className="w-4 h-4 text-amber-400" /> Active Model Weights Registry
            </h2>
            <div className="flex flex-col gap-3">
              {checkpoints.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">No checkpoints registered in ledger.</div>
              ) : (
                checkpoints.map((cp) => (
                  <div key={cp.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white block font-heading">{cp.name}</strong>
                        <span className="text-[8px] text-gray-500">Params: {cp.parameters}</span>
                      </div>
                      <span className="text-[10px] text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 uppercase tracking-wider font-bold">
                        {cp.version}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-gray-400 border-t border-white/5 pt-2">
                      <span>Loss: <strong className="text-white font-bold">{cp.loss}</strong></span>
                      <span>By: {cp.registeredBy.split("@")[0]}</span>
                      <button onClick={() => handleDeleteModel(cp.id, cp.name)} className="text-red-400 hover:text-red-300 font-bold cursor-pointer font-body">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
