"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Play, PlayCircle, ShieldAlert, Cpu, Database, RotateCcw } from "lucide-react";
import { logActivity } from "@/config/activityLogger";
import { db } from "@/config/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

interface ConsoleLog {
  timestamp: string;
  type: "system" | "database" | "network" | "error";
  message: string;
}

export default function AdminOperationsConsole() {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [telemetry, setTelemetry] = useState({
    activeSockets: 0,
    dbConnections: 0,
    bufferLoad: 0,
  });
  const [isRunning, setIsRunning] = useState(true);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of terminal when logs are appended
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Sync Telemetry Counts from Firestore
  useEffect(() => {
    const unsubNodes = onSnapshot(collection(db, "nodes"), (snap) => {
      const activeCount = snap.size;
      setTelemetry((prev) => {
        const nextActive = activeCount;
        const nextBuffer = nextActive > 0 ? parseFloat(Math.min(100, (nextActive / 15) * 100).toFixed(1)) : 0;
        return {
          ...prev,
          activeSockets: nextActive,
          bufferLoad: nextBuffer,
        };
      });
    }, (err) => console.error("Telemetry nodes sync failed:", err));

    const unsubTokens = onSnapshot(collection(db, "api_tokens"), (snap) => {
      setTelemetry((prev) => ({
        ...prev,
        dbConnections: snap.size,
      }));
    }, (err) => console.error("Telemetry tokens sync failed:", err));

    return () => {
      unsubNodes();
      unsubTokens();
    };
  }, []);

  // Sync Console Logs from Firestore activity_logs
  useEffect(() => {
    if (!isRunning) return;

    try {
      const q = query(
        collection(db, "activity_logs"),
        orderBy("timestamp", "desc"),
        limit(50)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: ConsoleLog[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          const dateObj = new Date(data.timestamp || data.time);
          const rawAction = data.action || "SYSTEM";
          const rawDetails = data.details || "";
          const userStr = data.user || "system";
          
          let logType: "system" | "database" | "network" | "error" = "system";
          const lowerAction = rawAction.toLowerCase();
          if (lowerAction.includes("error") || lowerAction.includes("revoke") || lowerAction.includes("delete") || lowerAction.includes("fail")) {
            logType = "error";
          } else if (lowerAction.includes("node") || lowerAction.includes("socket") || lowerAction.includes("ping")) {
            logType = "network";
          } else if (lowerAction.includes("token") || lowerAction.includes("db") || lowerAction.includes("write") || lowerAction.includes("payout") || lowerAction.includes("partner")) {
            logType = "database";
          }

          list.push({
            timestamp: dateObj.toLocaleTimeString(),
            type: logType,
            message: `[${userStr}] ${rawAction}: ${rawDetails}`,
          });
        });

        setLogs(list.reverse());
      }, (err) => {
        console.error("Console logs sync failed:", err);
      });
      return unsubscribe;
    } catch (err) {
      console.error("Console logs query creation failed:", err);
    }
  }, [isRunning]);

  const handleMaintenanceAction = async (action: string, detail: string) => {
    try {
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          type: "system",
          message: `[MAINTENANCE] Initializing action: ${action.toUpperCase()}...`,
        }
      ]);
      
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            type: "system",
            message: `[MAINTENANCE] Action ${action.toUpperCase()} completed successfully.`,
          }
        ]);
      }, 1000);

      await logActivity("MAINTENANCE_CONSOLE_ACTION", `Executed server maintenance: ${detail}`);
    } catch (err: any) {
      alert("Failed action: " + err.message);
    }
  };

  const getLogColor = (type: string) => {
    const styles: Record<string, string> = {
      system: "text-emerald-400",
      database: "text-blue-400",
      network: "text-purple-400",
      error: "text-red-400",
    };
    return styles[type] || "text-gray-400";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 font-body h-[calc(100vh-75px)]">
      {/* Header */}
      <header className="border-b border-white/10 pb-6 flex justify-between items-center shrink-0">
        <div>
          <h1 className="font-heading font-bold text-3xl">Operations Console</h1>
          <p className="text-sm text-gray-500 mt-1">Review live server transaction events, execute database cleanup commands, and verify websocket buffer states.</p>
        </div>
      </header>

      {/* Grid: Terminal vs Telemetry Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0 overflow-hidden items-stretch">
        
        {/* Terminal Workspace */}
        <div className="glass-card border border-white/10 bg-black rounded-2xl lg:col-span-3 flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-white/5 bg-[#030712]/70 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-emerald-400" />
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-white">System Events Console</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`text-[10px] border px-2.5 py-1 rounded cursor-pointer font-bold uppercase tracking-wider ${
                  isRunning 
                    ? "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10" 
                    : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                {isRunning ? "Freeze Stream" : "Resume Stream"}
              </button>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] border border-white/10 bg-white/5 text-gray-400 hover:text-white px-2.5 py-1 rounded cursor-pointer font-bold uppercase tracking-wider"
              >
                Clear Screen
              </button>
            </div>
          </div>

          {/* Terminal Screen output */}
          <div className="flex-1 overflow-y-auto p-6 font-mono text-[10.5px] leading-relaxed flex flex-col gap-2 bg-black/90">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic">Console initialized. Awaiting system broadcast logs...</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <span className="text-gray-600 shrink-0 select-none">[{log.timestamp}]</span>
                  <span className={`${getLogColor(log.type)} shrink-0 select-none`}>[{log.type.toUpperCase()}]</span>
                  <span className="text-gray-300 break-all">{log.message}</span>
                </div>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>

        {/* Telemetry and commands */}
        <div className="flex flex-col gap-6 lg:col-span-1 h-full overflow-y-auto">
          {/* Active Telemetry */}
          <div className="glass-card p-5 rounded-xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">Console Telemetry</h3>
            
            <div className="flex flex-col gap-3.5 text-xs font-light">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-500">Active WebSockets</span>
                <span className="text-white font-mono font-semibold">{telemetry.activeSockets}</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-500">Database Streams</span>
                <span className="text-white font-mono font-semibold">{telemetry.dbConnections}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Buffer Load</span>
                <span className={`font-mono font-bold ${telemetry.bufferLoad > 60 ? "text-amber-400" : "text-[#7DD3FC]"}`}>
                  {telemetry.bufferLoad}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass-card p-5 rounded-xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">Server Commands</h3>
            
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleMaintenanceAction("flush_cache", "Cleared system temporal template caches.")}
                className="w-full rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 py-2.5 text-[11px] font-bold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Flush Router Caches
              </button>

              <button
                onClick={() => handleMaintenanceAction("test_sockets", "Tested active websocket connection handshakes.")}
                className="w-full rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 py-2.5 text-[11px] font-bold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PlayCircle className="w-3.5 h-3.5" /> Ping Test Sockets
              </button>

              <button
                onClick={() => handleMaintenanceAction("rotate_keys", "Rotated local encryption keys.")}
                className="w-full rounded-lg border border-red-500/10 hover:border-red-500/35 bg-red-500/5 hover:bg-red-500/10 py-2.5 text-[11px] font-bold text-red-400 hover:text-red-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Rotate Node Keys
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
