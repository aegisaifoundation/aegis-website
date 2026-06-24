"use client";

import { useEffect, useState } from "react";
import { Shield, TrendingUp, Users, Server, Activity, Plus, Trash2, Award, Clock, Sparkles, LayoutDashboard, Heart, BarChart3 } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { getOrCreateUserProfile, UserProfile } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";

interface StrategyLog {
  id: string;
  title: string;
  department: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  details: string;
  author: string;
  timestamp: number;
}

interface DepartmentStatus {
  id: string;
  name: string;
  status: "Operational" | "Under Review" | "Optimizing" | "Maintenance";
  updatedBy: string;
  updatedAt: string;
}

const DEPARTMENTS = [
  "Technology & AI",
  "Product & UX",
  "Cybersecurity & SOC",
  "Sales & Marketing",
  "Operations & Finance",
  "HR & Legal"
];

export default function ExecutiveSuiteHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"directives" | "heartbeats" | "analytics">("directives");
  
  // Strategy logs
  const [strategyLogs, setStrategyLogs] = useState<StrategyLog[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDept, setNewDept] = useState(DEPARTMENTS[0]);
  const [newPriority, setNewPriority] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [newDetails, setNewDetails] = useState("");
  const [submittingLog, setSubmittingLog] = useState(false);

  // Departmental Statuses
  const [deptStatuses, setDeptStatuses] = useState<DepartmentStatus[]>([]);
  const [updatingDept, setUpdatingDept] = useState<string | null>(null);

  // High-level Stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalNodes, setTotalNodes] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const prof = await getOrCreateUserProfile(user.uid, user.email || "");
          setProfile(prof);
        } catch (err) {
          console.error("Failed to load user profile:", err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sync Strategy Logs
  useEffect(() => {
    const q = query(collection(db, "executive_strategy"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs: StrategyLog[] = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as StrategyLog);
      });
      setStrategyLogs(logs);
    }, (err) => console.error("Strategy logs sync failed:", err));

    return unsubscribe;
  }, []);

  // Sync Department Statuses
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "department_statuses"), (snapshot) => {
      const statuses: DepartmentStatus[] = [];
      snapshot.forEach((doc) => {
        statuses.push({ id: doc.id, ...doc.data() } as DepartmentStatus);
      });
      
      // If collection is empty, initialize default statuses
      if (statuses.length === 0) {
        DEPARTMENTS.forEach(async (dept) => {
          const id = dept.toLowerCase().replace(/[^a-z0-9]/g, "_");
          await setDoc(doc(db, "department_statuses", id), {
            name: dept,
            status: "Operational",
            updatedBy: "System",
            updatedAt: new Date().toISOString()
          });
        });
      } else {
        setDeptStatuses(statuses);
      }
    }, (err) => console.error("Department statuses sync failed:", err));

    return unsubscribe;
  }, []);

  // Fetch count stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnap = await getDocs(collection(db, "admins"));
        setTotalUsers(usersSnap.size);

        const nodesSnap = await getDocs(collection(db, "nodes"));
        setTotalNodes(nodesSnap.size);

        const sessionsSnap = await getDocs(collection(db, "sessions"));
        setActiveSessions(sessionsSnap.size);

        const logsSnap = await getDocs(collection(db, "activity_logs"));
        setTotalLogs(logsSnap.size);
      } catch (err) {
        console.error("Failed to fetch aggregate counts:", err);
      }
    }
    fetchStats();
  }, []);

  const handlePostStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSubmittingLog(true);
    try {
      const logData = {
        title: newTitle.trim(),
        department: newDept,
        priority: newPriority,
        details: newDetails.trim(),
        author: profile.email,
        timestamp: Date.now()
      };

      await addDoc(collection(db, "executive_strategy"), logData);
      await logActivity("CREATE_STRATEGY_LOG", `Executive strategy posted: "${newTitle}" for ${newDept}`);
      await addNotification("EXECUTIVE", `New Executive update published for ${newDept}: "${newTitle}"`);

      setNewTitle("");
      setNewDetails("");
      alert("Executive Strategy Log posted successfully.");
    } catch (err: any) {
      alert("Failed to post log: " + err.message);
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleDeleteLog = async (id: string, title: string) => {
    if (confirm(`Delete Strategy log "${title}"?`)) {
      try {
        await deleteDoc(doc(db, "executive_strategy", id));
        await logActivity("DELETE_STRATEGY_LOG", `Deleted strategy log "${title}"`);
      } catch (err: any) {
        alert("Failed to delete log: " + err.message);
      }
    }
  };

  const handleStatusChange = async (deptId: string, name: string, newStatus: string) => {
    if (!profile) return;
    setUpdatingDept(deptId);
    try {
      await setDoc(doc(db, "department_statuses", deptId), {
        status: newStatus,
        updatedBy: profile.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await logActivity("UPDATE_DEPT_STATUS", `Updated status of ${name} to ${newStatus}`);
      await addNotification("SYSTEM", `${name} status updated to [${newStatus}] by Executive Office`);
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingDept(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "High": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Operational": return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "Optimizing": return "text-cyan-400 border-cyan-500/20 bg-cyan-500/5";
      case "Under Review": return "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";
      default: return "text-rose-400 border-rose-500/20 bg-rose-500/5";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-gray-500 animate-pulse">
        Establishing connection to Executive database capsule...
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-red-950/20 to-black overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl tracking-wide text-white uppercase">
              Executive Suite Boardroom
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              C-Suite workspace to issue directives, calibrate operational statuses, and review high-level business diagnostics.
            </p>
          </div>
        </div>

        {/* Sub-Tab Controls */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0 self-start md:self-auto font-body">
          <button
            onClick={() => setActiveSubTab("directives")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "directives" ? "bg-red-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Directives
          </button>
          <button
            onClick={() => setActiveSubTab("heartbeats")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "heartbeats" ? "bg-red-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Heartbeats
          </button>
          <button
            onClick={() => setActiveSubTab("analytics")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "analytics" ? "bg-red-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </button>
        </div>
      </div>

      {/* Grid: Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">C-Suite Staff</span>
            <span className="text-xl font-bold font-heading text-white">{totalUsers}</span>
          </div>
          <div className="p-2 rounded bg-blue-500/5 text-blue-400 border border-blue-500/10"><Users className="w-4 h-4" /></div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Active Nodes</span>
            <span className="text-xl font-bold font-heading text-white">{totalNodes}</span>
          </div>
          <div className="p-2 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10"><Server className="w-4 h-4" /></div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">WebSocket Streams</span>
            <span className="text-xl font-bold font-heading text-white">{activeSessions}</span>
          </div>
          <div className="p-2 rounded bg-purple-500/5 text-purple-400 border border-purple-500/10"><Activity className="w-4 h-4" /></div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Audit logs</span>
            <span className="text-xl font-bold font-heading text-white">{totalLogs}</span>
          </div>
          <div className="p-2 rounded bg-red-500/5 text-red-400 border border-red-500/10"><TrendingUp className="w-4 h-4" /></div>
        </div>
      </div>

      {/* Tab: Strategic Directives */}
      {activeSubTab === "directives" && (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <form onSubmit={handlePostStrategy} className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-400" /> Broadcast Directive
            </h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Directive Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Purge CDN edge caches"
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-red-500 text-xs text-white"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Target Department</label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-red-500 text-xs text-gray-300"
              >
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Priority Level</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-red-500 text-xs text-gray-300"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Actionable parameters</label>
              <textarea
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                placeholder="Detail strategy metrics and timelines..."
                rows={3}
                className="rounded-lg bg-white/5 border border-white/10 p-3 outline-none focus:border-red-500 text-xs text-white resize-none"
                required
              />
            </div>
            <button type="submit" disabled={submittingLog} className="rounded bg-red-500 hover:bg-red-600 py-2 text-xs font-bold text-white transition-all cursor-pointer">
              {submittingLog ? "BROADCASTING..." : "DISPATCH"}
            </button>
          </form>

          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-red-400" /> Active Directives
            </h2>
            <div className="flex flex-col gap-3">
              {strategyLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">No active directives.</div>
              ) : (
                strategyLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <strong className="text-white text-xs block">{log.title}</strong>
                        <span className="text-[9px] text-gray-400">Target: <strong className="text-gray-200">{log.department}</strong></span>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getPriorityColor(log.priority)}`}>
                        {log.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-normal font-light">{log.details}</p>
                    <div className="flex justify-between items-center text-[8px] text-gray-500 border-t border-white/5 pt-2">
                      <span>By: {log.author}</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <button onClick={() => handleDeleteLog(log.id, log.title)} className="text-red-400 hover:text-red-300 font-bold cursor-pointer">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Heartbeats */}
      {activeSubTab === "heartbeats" && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6 max-w-2xl mx-auto w-full">
          <div>
            <h2 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400" /> Departmental Operational Heartbeats
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">Calibrate overall heartbeat statuses visible to public enclaves and developer nodes.</p>
          </div>
          <div className="flex flex-col gap-3">
            {deptStatuses.map((dept) => (
              <div key={dept.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-white block">{dept.name}</span>
                  <span className="text-[8px] text-gray-500">Updated: {new Date(dept.updatedAt).toLocaleDateString()} by {dept.updatedBy.split("@")[0]}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(dept.status)}`}>
                    {dept.status}
                  </span>
                  <select
                    value={dept.status}
                    disabled={updatingDept === dept.id}
                    onChange={(e) => handleStatusChange(dept.id, dept.name, e.target.value)}
                    className="rounded bg-black border border-white/10 px-2 py-1 text-[10px] text-gray-300 focus:border-red-500 outline-none"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Optimizing">Optimizing</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Analytics */}
      {activeSubTab === "analytics" && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6 max-w-3xl mx-auto w-full">
          <div>
            <h2 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-red-400" /> Executive Departmental Analytics Audit
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">Aggregate system calibrations, consensus pings history, and database operations indexes.</p>
          </div>

          <div className="flex flex-col gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
              <div className="flex justify-between items-center text-gray-400">
                <span>Database Write Operations Load</span>
                <span className="text-white font-bold">{totalLogs} ops</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, (totalLogs / 500) * 100)}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
              <div className="flex justify-between items-center text-gray-400">
                <span>Consortium Node Infrastructure Capacity</span>
                <span className="text-white font-bold">{totalNodes * 8} vCPUs ({totalNodes} nodes)</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-[#4D7CFE] h-full" style={{ width: `${Math.min(100, (totalNodes / 20) * 100)}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
              <div className="flex justify-between items-center text-gray-400">
                <span>Total Registered Staff & Administrators</span>
                <span className="text-white font-bold">{totalUsers} admins</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, (totalUsers / 30) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
