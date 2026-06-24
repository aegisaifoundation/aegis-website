"use client";

import { useState, useEffect } from "react";
import { Activity, Network, AlertCircle, RefreshCw, Server, ShieldCheck, Zap } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, query, orderBy, limit } from "firebase/firestore";

interface DiagnosticLog {
  id: string;
  timestamp: string;
  sourceNode: string;
  targetNode: string;
  latency: number;
  status: "nominal" | "degraded" | "failed";
}

export default function AdminNetworkDiagnostics() {
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [activeRoute, setActiveRoute] = useState<string>("boston-paris");
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);
  const [pingRunning, setPingRunning] = useState(false);
  const [simResults, setSimResults] = useState<string[]>([]);
  const [simulating, setSimulating] = useState(false);

  // Sync Diagnostics Logs
  useEffect(() => {
    try {
      const q = query(
        collection(db, "diagnostic_logs"),
        orderBy("timestampNum", "desc"),
        limit(50)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: DiagnosticLog[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as any);
        });
        
        setLogs(list);

        if (list.length > 0) {
          const latencies = list.slice(0, 12).map((log) => log.latency).reverse();
          setLatencyHistory(latencies);
        } else {
          setLatencyHistory([]);
        }
      }, (err) => {
        console.error("Telemetry sync failed:", err);
      });
      return unsubscribe;
    } catch (err) {
      console.error("Telemetry query creation failed:", err);
    }
  }, []);

  const runTracerouteSimulation = () => {
    if (simulating) return;
    setSimulating(true);
    setSimResults(["Initializing socket route simulation...", "Resolving cryptographic key consensus paths..."]);

    const routeData: Record<string, string[]> = {
      "boston-paris": [
        "Hops 1: AEGIS-US-EAST-01 (Boston Node Capsule) - IP: 18.23.41.98 [3ms]",
        "Hops 2: US-Atlantic Aggregator Hub - IP: 74.125.99.12 [36ms]",
        "Hops 3: EU-West Edge Router (Paris) - IP: 195.154.22.41 [41ms]",
        "Hops 4: AEGIS-EU-WEST-02 (Paris Node Client) - Nominal [42ms]"
      ],
      "tokyo-boston": [
        "Hops 1: AEGIS-APAC-SOUTH-03 (Tokyo Node Capsule) - IP: 106.185.12.3 [4ms]",
        "Hops 2: Pacific Submarine Gateway (Hawaii) - IP: 72.14.234.8 [52ms]",
        "Hops 3: US-West Coast Aggregator - IP: 172.217.15.9 [62ms]",
        "Hops 4: AEGIS-US-EAST-01 (Boston Node Client) - Nominal [68ms]"
      ],
      "saopaulo-paris": [
        "Hops 1: AEGIS-LATAM-04 (São Paulo Node Capsule) - IP: 200.180.99.1 [5ms]",
        "Hops 2: South-Atlantic Relay Gateway - IP: 104.244.42.1 [88ms]",
        "Hops 3: EU-West Edge Router (Paris) - IP: 195.154.22.41 [108ms]",
        "Hops 4: AEGIS-EU-WEST-02 (Paris Node Client) - Degraded Jitter [112ms]"
      ]
    };

    let index = 0;
    const steps = routeData[activeRoute] || [];
    
    const interval = setInterval(() => {
      if (index < steps.length) {
        setSimResults((prev) => [...prev, steps[index]]);
        index++;
      } else {
        setSimResults((prev) => [...prev, "Simulation finalized. Path verification signatures stored in Consensus."]);
        setSimulating(false);
        clearInterval(interval);

        const logId = `diag-${Date.now()}`;
        const sourceName = activeRoute === "boston-paris" ? "AEGIS-US-EAST-01" : activeRoute === "tokyo-boston" ? "AEGIS-APAC-SOUTH-03" : "AEGIS-LATAM-04";
        const targetName = activeRoute === "saopaulo-paris" ? "AEGIS-EU-WEST-02" : activeRoute === "tokyo-boston" ? "AEGIS-US-EAST-01" : "AEGIS-EU-WEST-02";
        const latVal = activeRoute === "boston-paris" ? 42 : activeRoute === "tokyo-boston" ? 68 : 112;
        const statVal = activeRoute === "saopaulo-paris" ? "degraded" : "nominal";
        
        setDoc(doc(db, "diagnostic_logs", logId), {
          timestamp: new Date().toLocaleTimeString(),
          sourceNode: sourceName,
          targetNode: targetName,
          latency: latVal,
          status: statVal,
          timestampNum: Date.now()
        }).catch(err => console.error("Failed to save diagnostic log:", err));
      }
    }, 1200);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      nominal: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      degraded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      failed: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 font-body">
      {/* Header */}
      <header className="border-b border-white/10 pb-6">
        <h1 className="font-heading font-bold text-3xl">Network Diagnostics & Telemetry</h1>
        <p className="text-sm text-gray-500 mt-1">Audit active data routing channels, run traceroute diagnostics, and inspect websocket ping latency.</p>
      </header>

      {/* Latency History Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latency Plot */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/40 lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#7DD3FC] animate-pulse" />
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-white">Live Latency Jitter (Last 12 Pings)</span>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              AVG: {latencyHistory.length > 0 ? Math.round(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length) : 0}ms
            </span>
          </div>

          <div className="h-44 w-full flex items-end">
            {latencyHistory.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 italic">
                No active latency data logged. Run route traceroute to create records.
              </div>
            ) : (
              <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4D7CFE" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4D7CFE" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Grid Lines */}
                <line x1="0" y1="35" x2="500" y2="35" stroke="white" strokeOpacity="0.05" strokeDasharray="3,3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="white" strokeOpacity="0.05" strokeDasharray="3,3" />
                <line x1="0" y1="115" x2="500" y2="115" stroke="white" strokeOpacity="0.05" strokeDasharray="3,3" />

                {/* Area path */}
                <path
                  d={`M 0,150 ${latencyHistory.map((val, idx) => `L ${idx * 45},${150 - (val / 120) * 110}`).join(" ")} L 495,150 Z`}
                  fill="url(#latencyGrad)"
                />

                {/* Line path */}
                <path
                  d={latencyHistory.map((val, idx) => `${idx === 0 ? "M" : "L"} ${idx * 45},${150 - (val / 120) * 110}`).join(" ")}
                  fill="none"
                  stroke="#4D7CFE"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Point Circles */}
                {latencyHistory.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={idx * 45}
                    cy={150 - (val / 120) * 110}
                    r="4"
                    fill="#7DD3FC"
                    stroke="#080d16"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            )}
          </div>
        </div>

        {/* Diagnostic controls */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/40 lg:col-span-1 flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">Route Testing Suite</h3>
            
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Select Diagnostics Target Route</label>
              <select
                value={activeRoute}
                onChange={(e) => setActiveRoute(e.target.value)}
                className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-[#4D7CFE] cursor-pointer"
              >
                <option value="boston-paris">US-EAST (Boston) ──&gt; EU-WEST (Paris)</option>
                <option value="tokyo-boston">APAC-SOUTH (Tokyo) ──&gt; US-EAST (Boston)</option>
                <option value="saopaulo-paris">LATAM (São Paulo) ──&gt; EU-WEST (Paris)</option>
              </select>
            </div>
          </div>

          <button
            onClick={runTracerouteSimulation}
            disabled={simulating}
            className="w-full rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] disabled:bg-gray-700 py-3.5 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" /> {simulating ? "SIMULATING PATH..." : "RUN ROUTE TRACEROUTE"}
          </button>
        </div>
      </div>

      {/* Traceroute Output Display */}
      {simResults.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Network className="w-4.5 h-4.5 text-[#7DD3FC]" />
            <span className="text-xs font-bold uppercase tracking-wider">Trace Diagnostics Outputs</span>
          </div>
          <div className="bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[10px] text-gray-400 flex flex-col gap-2 leading-relaxed shadow-inner">
            {simResults.map((step, idx) => (
              <div key={idx} className={step.includes("Nominal") || step.includes("finalized") ? "text-emerald-400" : step.includes("Degraded") ? "text-amber-400" : ""}>
                &gt; {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Diagnostics Logs */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30">
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            <h2 className="font-heading font-bold text-lg">Active Telemetry Logs</h2>
          </div>
          <button
            onClick={() => {
              setPingRunning(true);
              setTimeout(() => {
                setPingRunning(false);
              }, 1200);
            }}
            className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pingRunning ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                <th className="py-2.5 px-4">Time Logged</th>
                <th className="py-2.5 px-4">Source Host</th>
                <th className="py-2.5 px-4">Destination Target</th>
                <th className="py-2.5 px-4">Consensus Ping</th>
                <th className="py-2.5 px-4">Connection Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-500">{log.timestamp}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{log.sourceNode}</td>
                  <td className="py-3.5 px-4 text-gray-300 text-xs">{log.targetNode}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-400">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      {log.latency} ms
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(log.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        log.status === "nominal" ? "bg-emerald-400" : log.status === "degraded" ? "bg-amber-400" : "bg-red-400"
                      }`} />
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
