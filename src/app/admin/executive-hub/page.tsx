"use client";

import { useEffect, useState } from "react";
import { Shield, TrendingUp, Users, Server, Activity, Plus, Trash2, Award, Clock, Sparkles } from "lucide-react";
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
    <div className="p-8 flex flex-col gap-10 max-w-7xl mx-auto">
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
              Central strategic center for CEO, CTO, and C-Suite leadership to audit core operations, set vision logs, and monitor divisional integrity.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 self-start md:self-auto font-mono text-[10px] text-gray-400">
          <Clock className="w-3.5 h-3.5 text-red-400" />
          <span>Strategic Sync Active</span>
        </div>
      </div>

      {/* Grid: Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">C-Suite & Admins</span>
            <span className="text-2xl font-bold font-heading text-white">{totalUsers}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/5 text-blue-400 border border-blue-500/10">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Compute Nodes</span>
            <span className="text-2xl font-bold font-heading text-white">{totalNodes}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Sessions</span>
            <span className="text-2xl font-bold font-heading text-white">{activeSessions}</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/5 text-purple-400 border border-purple-500/10">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Audited Activity logs</span>
            <span className="text-2xl font-bold font-heading text-white">{totalLogs}</span>
          </div>
          <div className="p-3 rounded-xl bg-red-500/5 text-red-400 border border-red-500/10">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Departmental Status Control */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
            <div>
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-400" /> Divisional Heartbeats
              </h2>
              <p className="text-[10px] text-gray-400 mt-1">
                Configure operational statuses for global departments visible to all administrators.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {deptStatuses.map((dept) => (
                <div key={dept.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-3 justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-white">{dept.name}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(dept.status)}`}>
                      {dept.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <select
                      value={dept.status}
                      disabled={updatingDept === dept.id}
                      onChange={(e) => handleStatusChange(dept.id, dept.name, e.target.value)}
                      className="rounded bg-black border border-white/10 px-2 py-1 text-[10px] text-gray-300 outline-none focus:border-red-500"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Optimizing">Optimizing</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                    <div className="text-[8px] text-gray-500 flex flex-col text-right justify-center truncate">
                      <span>By: {dept.updatedBy.split("@")[0]}</span>
                      <span>{new Date(dept.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns: Strategy & Vision Board */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Create Vision Log */}
          <form onSubmit={handlePostStrategy} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-400" /> Broadcast Strategy Directive
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Directive Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Expand H100 Cluster footprint"
                  className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-red-500 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Target Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-red-500 text-xs text-gray-300"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-red-500 text-xs text-gray-300"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Alert</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Strategic Directive Details</label>
              <textarea
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                placeholder="Specify precise actionable parameters, timelines, and execution benchmarks..."
                rows={4}
                className="rounded-lg bg-white/5 border border-white/10 p-3.5 outline-none focus:border-red-500 text-xs text-white leading-relaxed resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submittingLog}
              className="rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-700 py-2.5 text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] self-end px-6 cursor-pointer"
            >
              {submittingLog ? "BROADCASTING..." : "BROADCAST DIRECTIVE"}
            </button>
          </form>

          {/* Strategy Logs History */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-red-400" /> Active Strategic Directives
            </h2>

            <div className="flex flex-col gap-4">
              {strategyLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">
                  No executive strategic directives currently active.
                </div>
              ) : (
                strategyLogs.map((log) => (
                  <div key={log.id} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col gap-3 hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-white text-sm">{log.title}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityColor(log.priority)}`}>
                            {log.priority}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">Targeting: <strong className="text-white">{log.department}</strong></span>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteLog(log.id, log.title)}
                        className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 hover:border-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed font-light whitespace-pre-wrap">{log.details}</p>

                    <div className="flex justify-between items-center border-t border-white/5 pt-3 text-[9px] text-gray-500">
                      <span>Broadcast by: <strong className="text-gray-400 font-semibold">{log.author}</strong></span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
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
