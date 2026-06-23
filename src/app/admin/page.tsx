"use client";

import { useEffect, useState } from "react";
import { Server, Users, Bot, Layers, Trash2, ShieldAlert, BarChart3, TrendingUp, Activity, CheckCircle, Check, X, Key, RefreshCw } from "lucide-react";
import { readCardContent, CardContent, defaultCardContent, useCardContent } from "@/config/cardContent";
import { useNodeRequests, deleteNodeRequest, clearNodeRequests, NodeRequest } from "@/config/adminSubmissions";
import { collection, getDocs, query, where, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { logActivity } from "@/config/activityLogger";

// Helper to generate a random 8-char password
function generateRandomPassword(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// Helper to generate unique userId
function generateUniqueUserId(name: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 12);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}_${rand}`;
}

// SHA-256 hashing helper using Web Crypto API
async function hashSHA256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function AdminDashboard() {
  const cardContent = useCardContent();
  const requests = useNodeRequests();

  // Firestore Stats state
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeNodesCount, setActiveNodesCount] = useState(0);
  const [todayEdits, setTodayEdits] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Approval credentials modal state
  const [credentialsModal, setCredentialsModal] = useState<{
    show: boolean;
    userId: string;
    email: string;
    password: string;
  } | null>(null);

  const handleApprove = async (req: NodeRequest) => {
    try {
      if (req.type === "node_registration") {
        // Create new node document in the nodes collection
        const id = `node-${Date.now()}`;
        const nodeDocRef = doc(db, "nodes", id);
        
        await setDoc(nodeDocRef, {
          id,
          name: req.name,
          country: req.country,
          // Generate semi-random lat/lng for visual placement or defaults
          latitude: Math.floor(Math.random() * 100) + 40,
          longitude: Math.floor(Math.random() * 400) + 150,
          latency: Math.floor(Math.random() * 50) + 20, // 20ms - 70ms
          status: "online",
          capabilities: req.gpuSpecs || "General Compute",
          lastHeartbeat: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          ownerId: req.userId || "",
        });

        // Update request status to 'approved'
        const requestRef = doc(db, "node_requests", req.id);
        await updateDoc(requestRef, {
          status: "approved",
        });

        await logActivity("APPROVE_NODE_REGISTRATION", `Approved node registration "${req.name}" for user ${req.email || req.userId}`);
        alert(`Successfully approved compute node: ${req.name}`);
        return;
      }

      const generatedUserId = generateUniqueUserId(req.name);
      const generatedPassword = generateRandomPassword();
      const hashedPass = await hashSHA256(generatedPassword);

      // 1. Write user to 'users' collection in Firestore
      const userRef = doc(db, "users", generatedUserId);
      await setDoc(userRef, {
        uid: generatedUserId,
        userId: generatedUserId,
        email: req.email,
        password: hashedPass,
        role: "node_operator",
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: "Never logged in",
        requestId: req.id,
      });

      // 2. Update request status to 'approved' and store generated details in node_requests doc
      const requestRef = doc(db, "node_requests", req.id);
      await updateDoc(requestRef, {
        status: "approved",
        approvedUserId: generatedUserId,
        approvedPassword: generatedPassword,
      });

      // 3. Log activity
      await logActivity("APPROVE_APPLICATION", `Approved node operator application for ${req.email}. Generated User ID: ${generatedUserId}`);

      // 4. Show modal
      setCredentialsModal({
        show: true,
        userId: generatedUserId,
        email: req.email,
        password: generatedPassword,
      });
    } catch (err: any) {
      alert("Failed to approve application: " + err.message);
    }
  };

  const handleReject = async (id: string, email: string) => {
    if (confirm(`Are you sure you want to REJECT the application for ${email}?`)) {
      try {
        const docRef = doc(db, "node_requests", id);
        await updateDoc(docRef, { status: "rejected" });
        await logActivity("REJECT_APPLICATION", `Rejected node operator application for ${email}`);
      } catch (err: any) {
        alert("Failed to reject application: " + err.message);
      }
    }
  };

  const handleQuarantine = async (id: string, email: string) => {
    if (confirm(`Are you sure you want to QUARANTINE the application for ${email}?`)) {
      try {
        const docRef = doc(db, "node_requests", id);
        await updateDoc(docRef, { status: "quarantined" });
        await logActivity("QUARANTINE_APPLICATION", `Quarantined node operator application for ${email}`);
      } catch (err: any) {
        alert("Failed to quarantine application: " + err.message);
      }
    }
  };

  // Chart data simulation
  const [visitorData] = useState([145, 232, 189, 312, 280, 410, 395]);
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Fetch Firestore Stats
  useEffect(() => {
    async function fetchStats() {
      try {
        // Users Count
        const usersSnap = await getDocs(collection(db, "admins"));
        setTotalUsers(usersSnap.size);

        // Nodes Count
        const nodesSnap = await getDocs(collection(db, "nodes"));
        setActiveNodesCount(nodesSnap.size);

        // Today's Edits Log Count
        const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const logsSnap = await getDocs(collection(db, "activity_logs"));
        let count = 0;
        logsSnap.forEach((doc) => {
          const data = doc.data();
          if (data.time && data.time.startsWith(todayStr)) {
            count++;
          }
        });
        setTodayEdits(count);
      } catch (err) {
        console.error("Failed to load statistics from Firestore:", err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, [cardContent, requests]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      deleteNodeRequest(id);
      await logActivity("DELETE_REQUEST", `Deleted node request application with ID: ${id}`);
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all node application history? This cannot be undone.")) {
      clearNodeRequests();
      await logActivity("CLEAR_REQUESTS", "Cleared all node application requests.");
    }
  };

  // Compile stats
  const stats = {
    totalCards: cardContent.technology.length + cardContent.sectors.length + cardContent.revenue.length + cardContent.agents.length + cardContent.agentFaqs.length,
    nodeRequests: requests.length,
    activeNodes: activeNodesCount || 4, // fallback default mock count if empty
    registeredUsers: totalUsers || 1,
    todayEdits: todayEdits,
  };

  // Submission History grouping for chart (Last 7 Days)
  const getSubmissionHistoryData = () => {
    const counts: Record<string, number> = {};
    const dates: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dates.push(label);
      counts[label] = 0;
    }

    requests.forEach((req) => {
      if (req.timestamp) {
        const label = new Date(req.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (label in counts) {
          counts[label]++;
        }
      }
    });

    return { labels: dates, values: dates.map((lbl) => counts[lbl]) };
  };

  const submissionsChart = getSubmissionHistoryData();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl">Dashboard Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time infrastructure statistics and nodes registration queues.</p>
        </div>
        {loadingStats && (
          <span className="text-xs text-gray-500 font-mono animate-pulse">Syncing live analytics...</span>
        )}
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-[#7DD3FC] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xl md:text-2xl font-extrabold tracking-tight">{stats.nodeRequests}</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Requests</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-purple-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xl md:text-2xl font-extrabold tracking-tight">{stats.totalCards}</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Total Cards</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-emerald-400 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xl md:text-2xl font-extrabold tracking-tight">{stats.activeNodes}</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Active Nodes</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-blue-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xl md:text-2xl font-extrabold tracking-tight">{stats.registeredUsers}</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Admin Users</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-4 col-span-2 lg:col-span-1">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-amber-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xl md:text-2xl font-extrabold tracking-tight">{stats.todayEdits}</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Edits Today</span>
          </div>
        </div>
      </div>

      {/* SVG Analytics Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Trend SVG Chart */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/40 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#7DD3FC]" />
              <span className="text-sm font-heading font-semibold text-white uppercase tracking-wider">Daily Visitors (Weekly Trend)</span>
            </div>
            <span className="text-xs text-emerald-400 font-bold font-mono">+12.4%</span>
          </div>
          
          <div className="relative h-48 w-full mt-4 flex items-end">
            {/* Custom SVG line chart */}
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4D7CFE" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4D7CFE" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="700" y2="50" stroke="white" strokeOpacity="0.05" strokeDasharray="5,5" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="white" strokeOpacity="0.05" strokeDasharray="5,5" />
              <line x1="0" y1="150" x2="700" y2="150" stroke="white" strokeOpacity="0.05" strokeDasharray="5,5" />
              
              {/* Gradient Area */}
              <path 
                d="M 50,180 L 150,120 L 250,150 L 350,90 L 450,110 L 550,40 L 650,60 L 650,180 L 50,180 Z" 
                fill="url(#visitorGrad)" 
              />
              {/* Smooth Stroke Line */}
              <path 
                d="M 50,180 Q 100,140 150,120 T 250,150 T 350,90 T 450,110 T 550,40 T 650,60" 
                fill="none" 
                stroke="#4D7CFE" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              {/* Points */}
              <circle cx="50" cy="180" r="4.5" fill="#4D7CFE" stroke="white" strokeWidth="1.5" />
              <circle cx="150" cy="120" r="4.5" fill="#4D7CFE" stroke="white" strokeWidth="1.5" />
              <circle cx="250" cy="150" r="4.5" fill="#4D7CFE" stroke="white" strokeWidth="1.5" />
              <circle cx="350" cy="90" r="4.5" fill="#4D7CFE" stroke="white" strokeWidth="1.5" />
              <circle cx="450" cy="110" r="4.5" fill="#4D7CFE" stroke="white" strokeWidth="1.5" />
              <circle cx="550" cy="40" r="4.5" fill="#4D7CFE" stroke="white" strokeWidth="1.5" />
              <circle cx="650" cy="60" r="4.5" fill="#4D7CFE" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="flex justify-between px-6 text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-2">
            {daysOfWeek.map((day, idx) => (
              <span key={idx}>{day}</span>
            ))}
          </div>
        </div>

        {/* Submissions Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/40 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-heading font-semibold text-white uppercase tracking-wider">Node Applications (Last 7 Days)</span>
            </div>
            <span className="text-xs text-purple-400 font-bold font-mono">Live</span>
          </div>

          <div className="relative h-48 w-full mt-4 flex items-end">
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="700" y2="50" stroke="white" strokeOpacity="0.05" strokeDasharray="5,5" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="white" strokeOpacity="0.05" strokeDasharray="5,5" />
              <line x1="0" y1="150" x2="700" y2="150" stroke="white" strokeOpacity="0.05" strokeDasharray="5,5" />
              
              {/* Dynamic Submissions Bars */}
              {submissionsChart.values.map((val, idx) => {
                const maxVal = Math.max(...submissionsChart.values, 1);
                // Math mapping: 180 height scale
                const barHeight = (val / maxVal) * 150 + 10;
                const xCoord = 50 + idx * 95;
                const yCoord = 180 - barHeight;
                
                return (
                  <g key={idx} className="group">
                    <rect 
                      x={xCoord} 
                      y={yCoord} 
                      width="35" 
                      height={barHeight} 
                      rx="4" 
                      fill={val > 0 ? "url(#purpleGrad)" : "rgba(255, 255, 255, 0.05)"}
                      className="transition-all duration-300 hover:fill-[#a855f7]"
                    />
                    {val > 0 && (
                      <text 
                        x={xCoord + 17.5} 
                        y={yCoord - 8} 
                        fill="white" 
                        textAnchor="middle" 
                        className="text-[10px] font-bold font-mono"
                      >
                        {val}
                      </text>
                    )}
                  </g>
                );
              })}
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between px-3 text-[10px] text-gray-500 font-semibold mt-2">
            {submissionsChart.labels.map((lbl, idx) => (
              <span key={idx} className="w-[80px] text-center truncate">{lbl}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      <section className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-white/5 pb-5">
          <div>
            <h2 className="font-heading font-bold text-xl">Compute Node Applications Queue</h2>
            <p className="text-xs text-gray-500 mt-1">Pending registrations from institutions and developers globally.</p>
          </div>
          {requests.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center justify-center gap-2 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 text-xs text-red-400 font-semibold rounded-lg px-4 py-2 transition-colors cursor-pointer"
            >
              Clear Queue History
            </button>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-4">
            <ShieldAlert className="w-10 h-10 text-gray-600" />
            <div className="text-sm text-gray-500">No node applications received yet.</div>
            <p className="text-xs text-gray-600 max-w-xs leading-normal">
              Submissions filled on the public "Join Network" form will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <span className="block font-semibold text-white">{req.name}</span>
                      <span className="block text-xs text-gray-500 font-mono mt-0.5">{req.email}</span>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono">
                      {req.type === "node_registration" ? (
                        <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-sans text-[10px] font-bold uppercase tracking-wider">
                          Node Reg
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-[#4D7CFE]/10 text-[#7DD3FC] border border-[#4D7CFE]/20">
                          {req.role}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-300 font-medium">
                      {req.type === "node_registration" ? (req.gpuSpecs || "General GPU") : (req.institution || "Independent")}
                    </td>
                    <td className="py-4 px-4 text-gray-400">{req.country || "N/A"}</td>
                    <td className="py-4 px-4 text-gray-500 font-mono text-xs">{req.date}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        req.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : req.status === "rejected"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : req.status === "quarantined"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          req.status === "approved"
                            ? "bg-emerald-400"
                            : req.status === "rejected"
                            ? "bg-red-400"
                            : req.status === "quarantined"
                            ? "bg-amber-400"
                            : "bg-blue-400 animate-pulse"
                        }`} />
                        {req.status ? req.status.toUpperCase() : "PENDING"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(!req.status || req.status === "pending") && (
                          <>
                            <button
                              onClick={() => handleApprove(req)}
                              className="text-emerald-400 hover:text-emerald-300 p-2 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Approve & Generate User credentials"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleQuarantine(req.id, req.email)}
                              className="text-amber-400 hover:text-amber-300 p-2 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Quarantine application"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(req.id, req.email)}
                              className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Reject application"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {req.status === "approved" && (
                          <button
                            onClick={() => setCredentialsModal({
                              show: true,
                              userId: req.approvedUserId || "",
                              email: req.email,
                              password: req.approvedPassword || "",
                            })}
                            className="text-xs font-semibold text-[#7DD3FC] border border-[#7DD3FC]/20 hover:border-[#7DD3FC]/50 hover:bg-[#7DD3FC]/5 px-2.5 py-1.5 rounded flex items-center gap-1 cursor-pointer"
                            title="View credentials"
                          >
                            <Key className="w-3.5 h-3.5" /> Credentials
                          </button>
                        )}

                        {(req.status === "rejected" || req.status === "quarantined") && (
                          <button
                            onClick={async () => {
                              try {
                                const docRef = doc(db, "node_requests", req.id);
                                await updateDoc(docRef, { status: "pending" });
                              } catch (err: any) {
                                alert("Failed to reset status: " + err.message);
                              }
                            }}
                            className="text-xs font-semibold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                            title="Reset application to pending"
                          >
                            <RefreshCw className="w-3 h-3" /> Reset
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(req.id)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete application record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Generated Credentials Modal */}
      {credentialsModal && credentialsModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-body">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 bg-[#030712] flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="font-heading font-bold text-lg text-white">Application Approved!</h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              Operator credentials have been generated and saved to the users collection. Copy them now to share with the user:
            </p>

            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-sans font-bold">Email Address</span>
                  <span className="text-white mt-1 block">{credentialsModal.email}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(credentialsModal.email);
                    alert("Email copied!");
                  }}
                  className="text-[10px] text-[#7DD3FC] hover:text-[#7DD3FC]/80 font-bold font-sans cursor-pointer border border-[#7DD3FC]/10 hover:border-[#7DD3FC]/30 bg-[#7DD3FC]/5 px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-sans font-bold">Generated User ID</span>
                  <span className="text-white mt-1 block">{credentialsModal.userId}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(credentialsModal.userId);
                    alert("User ID copied!");
                  }}
                  className="text-[10px] text-[#7DD3FC] hover:text-[#7DD3FC]/80 font-bold font-sans cursor-pointer border border-[#7DD3FC]/10 hover:border-[#7DD3FC]/30 bg-[#7DD3FC]/5 px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-sans font-bold">Temporary Password</span>
                  <span className="text-white mt-1 block font-bold text-emerald-400">{credentialsModal.password}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(credentialsModal.password);
                    alert("Password copied!");
                  }}
                  className="text-[10px] text-[#7DD3FC] hover:text-[#7DD3FC]/80 font-bold font-sans cursor-pointer border border-[#7DD3FC]/10 hover:border-[#7DD3FC]/30 bg-[#7DD3FC]/5 px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              onClick={() => setCredentialsModal(null)}
              className="w-full py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/20 hover:border-emerald-500/40 text-xs font-bold text-emerald-200 transition-all cursor-pointer text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
