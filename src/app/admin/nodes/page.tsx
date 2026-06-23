"use client";

import { useEffect, useState } from "react";
import { Server, Plus, Trash2, ShieldCheck, Activity, Globe, Wifi, WifiOff } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { logActivity } from "@/config/activityLogger";

interface AINode {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  latency: number;
  status: "online" | "offline";
  capabilities: string;
  lastHeartbeat: string;
  timestamp: number;
}

export default function AdminNodesRegistry() {
  const [nodes, setNodes] = useState<AINode[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Node form state
  const [newName, setNewName] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newLat, setNewLat] = useState(0);
  const [newLng, setNewLng] = useState(0);
  const [newLatency, setNewLatency] = useState(45);
  const [newCapabilities, setNewCapabilities] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Sync Nodes from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "nodes"), (snapshot) => {
      const list: AINode[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as AINode);
      });

      if (list.length === 0 && snapshot.empty) {
        seedDefaultNodes();
      } else {
        list.sort((a, b) => b.timestamp - a.timestamp);
        setNodes(list);
        setLoading(false);
      }
    }, (err) => {
      console.error("Nodes sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const seedDefaultNodes = async () => {
    const defaults: Omit<AINode, "id">[] = [
      {
        name: "AEGIS-US-EAST-01",
        country: "United States (Boston)",
        latitude: 35, // mapped coordinates for custom SVG
        longitude: 180,
        latency: 38,
        status: "online",
        capabilities: "LLM Fine-tuning, RAG Indexing, Vector Search",
        lastHeartbeat: new Date().toLocaleTimeString(),
        timestamp: Date.now() - 5000,
      },
      {
        name: "AEGIS-EU-WEST-02",
        country: "France (Paris)",
        latitude: 50,
        longitude: 320,
        latency: 42,
        status: "online",
        capabilities: "Federated Learning Aggregator, Image Models",
        lastHeartbeat: new Date().toLocaleTimeString(),
        timestamp: Date.now() - 4000,
      },
      {
        name: "AEGIS-APAC-SOUTH-03",
        country: "Japan (Tokyo)",
        latitude: 65,
        longitude: 550,
        latency: 68,
        status: "online",
        capabilities: "Speech Recognition, Real-time Translation",
        lastHeartbeat: new Date().toLocaleTimeString(),
        timestamp: Date.now() - 3000,
      },
      {
        name: "AEGIS-LATAM-04",
        country: "Brazil (São Paulo)",
        latitude: 140,
        longitude: 240,
        latency: 112,
        status: "offline",
        capabilities: "Vector Index Backup, Analytics enclaves",
        lastHeartbeat: "3 hours ago",
        timestamp: Date.now() - 2000,
      }
    ];

    try {
      for (const node of defaults) {
        const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        await setDoc(doc(db, "nodes", id), node);
      }
    } catch (err) {
      console.error("Failed to seed default nodes:", err);
    }
  };

  const handleRegisterNode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const name = newName.trim();
    const country = newCountry.trim();
    const cap = newCapabilities.trim() || "General Compute";

    if (!name || !country) {
      setFormError("Node Name and Location are required.");
      return;
    }

    try {
      const id = `node-${Date.now()}`;
      const item: AINode = {
        id,
        name,
        country,
        latitude: newLat || Math.floor(Math.random() * 100) + 40,
        longitude: newLng || Math.floor(Math.random() * 400) + 150,
        latency: newLatency || 50,
        status: "online",
        capabilities: cap,
        lastHeartbeat: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
      };

      await setDoc(doc(db, "nodes", id), item);
      setFormSuccess(`Successfully registered node "${name}".`);
      setNewName("");
      setNewCountry("");
      setNewCapabilities("");
      setNewLat(0);
      setNewLng(0);
      
      await logActivity("REGISTER_NODE", `Registered compute node: ${name}`);
    } catch (err: any) {
      setFormError(err.message || "Failed to register node.");
    }
  };

  const handleDeleteNode = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to completely de-register node "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "nodes", id));
        alert("Node de-registered.");
        await logActivity("DELETE_NODE", `De-registered AI node: ${name}`);
      } catch (err: any) {
        alert("Failed to delete node: " + err.message);
      }
    }
  };

  const onlineNodes = nodes.filter((n) => n.status === "online");
  const offlineNodes = nodes.filter((n) => n.status === "offline");
  const averageLatency = nodes.length > 0 
    ? Math.round(nodes.reduce((acc, curr) => acc + curr.latency, 0) / nodes.length) 
    : 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl">AI Compute Node Registry</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor active decentralized physical nodes, check telemetry heartbeats, and audit network routes.</p>
        </div>
      </header>

      {/* Overview Stat Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-[#7DD3FC] shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight">{nodes.length}</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Total Registered</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-emerald-400 shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight text-emerald-400">{onlineNodes.length}</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Online Nodes</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-red-400 shrink-0">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight text-red-400">{offlineNodes.length}</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Offline Nodes</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-amber-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight">{averageLatency} ms</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Average Latency</span>
          </div>
        </div>
      </div>

      {/* SVG Telemetry Map Visualizer */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/40 flex flex-col gap-4">
        <h2 className="text-sm font-heading font-semibold uppercase tracking-wider text-white">Geographic Node Distribution Telemetry</h2>
        <div className="relative h-64 md:h-80 bg-black/60 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center p-4">
          {/* Custom high-tech outline grid map */}
          <svg viewBox="0 0 800 300" className="w-full h-full overflow-visible opacity-80 text-gray-800">
            {/* World grid outlines (minimal corporate style) */}
            <path d="M 50,150 Q 150,50 350,120 T 750,150" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
            <path d="M 50,100 Q 250,220 500,80 T 750,100" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
            <path d="M 100,50 Q 300,300 600,100 T 700,200" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
            
            {/* Render Node Dots */}
            {nodes.map((node) => (
              <g key={node.id} className="group cursor-pointer">
                {/* Pulse background for online nodes */}
                {node.status === "online" && (
                  <circle 
                    cx={node.longitude} 
                    cy={node.latitude} 
                    r="12" 
                    fill="#10b981" 
                    fillOpacity="0.25"
                    className="animate-ping"
                  />
                )}
                {/* Node center point */}
                <circle 
                  cx={node.longitude} 
                  cy={node.latitude} 
                  r="5" 
                  fill={node.status === "online" ? "#10b981" : "#ef4444"} 
                  stroke="white" 
                  strokeWidth="1"
                />
                {/* Hover details label */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <rect 
                    x={node.longitude - 60} 
                    y={node.latitude - 42} 
                    width="120" 
                    height="32" 
                    rx="4" 
                    fill="#030712" 
                    stroke="white" 
                    strokeOpacity="0.2"
                    strokeWidth="1"
                  />
                  <text 
                    x={node.longitude} 
                    y={node.latitude - 30} 
                    fill="white" 
                    textAnchor="middle" 
                    className="text-[8px] font-bold"
                  >
                    {node.name}
                  </text>
                  <text 
                    x={node.longitude} 
                    y={node.latitude - 18} 
                    fill={node.status === "online" ? "#a7f3d0" : "#fca5a5"} 
                    textAnchor="middle" 
                    className="text-[7px] font-semibold"
                  >
                    {node.status.toUpperCase()} | {node.latency}ms
                  </text>
                </g>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Register Node Form */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Plus className="w-5 h-5 text-[#7DD3FC]" />
          <h2 className="font-heading font-bold text-lg">Register Physical Compute Node</h2>
        </div>

        <form onSubmit={handleRegisterNode} className="grid md:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Node Identificator Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. AEGIS-NODE-EU-05"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Location City / Country</label>
            <input
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              placeholder="e.g. Germany (Munich)"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Node Capabilities</label>
            <input
              value={newCapabilities}
              onChange={(e) => setNewCapabilities(e.target.value)}
              placeholder="e.g. LLM Inference, RAG"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
            />
          </div>

          <button className="rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer h-[42px] flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> REGISTER NODE
          </button>
        </form>
        {formError && <p className="text-xs text-red-400 mt-1">{formError}</p>}
        {formSuccess && <p className="text-xs text-emerald-400 mt-1">{formSuccess}</p>}
      </div>

      {/* Nodes Table List */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
          <Server className="w-5 h-5 text-purple-400" />
          <h2 className="font-heading font-bold text-lg">Active Mesh Nodes</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing telemetry meshes...</div>
        ) : nodes.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <Activity className="w-8 h-8 text-gray-600" />
            <p className="text-sm text-gray-500">No nodes registered on the mesh network.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                  <th className="py-3 px-4">Node Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Capabilities</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Telemetry Heartbeat</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {nodes.map((node) => (
                  <tr key={node.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      {node.name}
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-xs">
                      {node.country}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400 max-w-xs truncate" title={node.capabilities}>
                      {node.capabilities}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-gray-400">
                      <span className={`px-2 py-0.5 rounded ${
                        node.latency < 50 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : node.latency < 100 
                          ? "bg-amber-500/10 text-amber-400" 
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {node.latency} ms
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">
                      {node.lastHeartbeat || "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        node.status === "online" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${node.status === "online" ? "bg-emerald-400" : "bg-red-400"}`} />
                        {node.status === "online" ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDeleteNode(node.id, node.name)}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove node from network registry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
