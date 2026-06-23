"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cpu, LogOut, ShieldCheck, Activity, Database, Server, RefreshCw, PlusCircle, KeyRound, Lock, Plus } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, doc, getDoc, deleteDoc, query, where, onSnapshot, addDoc, updateDoc } from "firebase/firestore";

interface UserProfile {
  userId: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface AINode {
  id: string;
  name: string;
  country: string;
  latency: number;
  status: "online" | "offline";
  capabilities: string;
  lastHeartbeat: string;
}

interface PendingRequest {
  id: string;
  name: string;
  country: string;
  gpuSpecs: string;
  status: "pending" | "approved" | "rejected" | "quarantined";
  date: string;
}

// Helper to hash password client-side using Web Crypto
async function hashPasswordSHA256(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");
  
  // Real-time Lists from Firestore
  const [userNodes, setUserNodes] = useState<AINode[]>([]);
  const [userRequests, setUserRequests] = useState<PendingRequest[]>([]);

  // Node registration form state
  const [nodeName, setNodeName] = useState("");
  const [nodeLocation, setNodeLocation] = useState("");
  const [gpuSpecs, setGpuSpecs] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // Mock live telemetry
  const [telemetry, setTelemetry] = useState({
    activeChannels: 4,
    latency: 18,
    dataProcessed: 284.5,
    tokensEarned: 12.8,
  });

  useEffect(() => {
    // Simulate real-time data changes
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        activeChannels: prev.activeChannels,
        latency: Math.max(12, prev.latency + Math.floor(Math.random() * 5) - 2),
        dataProcessed: parseFloat((prev.dataProcessed + Math.random() * 0.1).toFixed(2)),
        tokensEarned: parseFloat((prev.tokensEarned + Math.random() * 0.002).toFixed(4)),
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function verifySession() {
      const sessionId = localStorage.getItem("aegis_user_session_id");
      if (!sessionId) {
        router.push("/login");
        return;
      }

      try {
        // 1. Fetch Session from Firestore
        const sessionRef = doc(db, "sessions", sessionId);
        const sessionSnap = await getDoc(sessionRef);

        if (!sessionSnap.exists()) {
          // Stale session, clean up
          localStorage.removeItem("aegis_user_session_id");
          localStorage.removeItem("aegis_user_id");
          localStorage.removeItem("aegis_user_email");
          window.dispatchEvent(new Event("aegis-user-login-changed"));
          router.push("/login");
          return;
        }

        const sessionData = sessionSnap.data();

        // 2. Fetch User Profile
        const userRef = doc(db, "users", sessionData.userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("User profile not found.");
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        setProfile({
          userId: userData.userId,
          email: userData.email,
          role: userData.role || "node_operator",
          status: userData.status || "active",
          createdAt: userData.createdAt || new Date().toISOString(),
        });
      } catch (err: any) {
        console.error("Session verification failed:", err);
        setError("Database validation failed. Please reload or login again.");
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, [router]);

  // Sync operator's nodes and requests in real-time
  useEffect(() => {
    if (!profile) return;

    // 1. Sync Nodes owned by this operator
    const nodesQuery = query(collection(db, "nodes"), where("ownerId", "==", profile.userId));
    const unsubscribeNodes = onSnapshot(nodesQuery, (snapshot) => {
      const list: AINode[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as AINode);
      });
      setUserNodes(list);
    }, (err) => {
      console.error("Failed to sync user nodes:", err);
    });

    // 2. Sync Pending/All Node requests submitted by this operator
    const requestsQuery = query(
      collection(db, "node_requests"),
      where("userId", "==", profile.userId),
      where("type", "==", "node_registration")
    );
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const list: PendingRequest[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          name: data.name || "",
          country: data.country || "",
          gpuSpecs: data.gpuSpecs || "",
          status: data.status || "pending",
          date: data.date || "",
        });
      });
      setUserRequests(list);
    }, (err) => {
      console.error("Failed to sync user requests:", err);
    });

    return () => {
      unsubscribeNodes();
      unsubscribeRequests();
    };
  }, [profile]);

  const handleLogout = async () => {
    const sessionId = localStorage.getItem("aegis_user_session_id");
    if (sessionId) {
      try {
        // Delete session document from Firestore to save storage space
        const sessionRef = doc(db, "sessions", sessionId);
        await deleteDoc(sessionRef);
      } catch (err) {
        console.error("Failed to delete session on Firestore:", err);
      }
    }

    // Clear local storage
    localStorage.removeItem("aegis_user_session_id");
    localStorage.removeItem("aegis_user_id");
    localStorage.removeItem("aegis_user_email");

    // Dispatch event to update navbar buttons
    window.dispatchEvent(new Event("aegis-user-login-changed"));
    router.push("/");
  };

  const handleRegisterNode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    if (!profile) return;

    const name = nodeName.trim();
    const country = nodeLocation.trim();
    const gpu = gpuSpecs.trim();

    if (!name || !country || !gpu) {
      setRegError("All fields are required.");
      return;
    }

    setRegLoading(true);
    try {
      const colRef = collection(db, "node_requests");
      await addDoc(colRef, {
        name,
        email: profile.email,
        country,
        gpuSpecs: gpu,
        userId: profile.userId,
        type: "node_registration",
        status: "pending",
        role: "Operator Node",
        institution: gpu,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: Date.now(),
      });

      setRegSuccess(`Successfully submitted node registration request for "${name}". Pending admin approval.`);
      setNodeName("");
      setNodeLocation("");
      setGpuSpecs("");
    } catch (err: any) {
      setRegError("Failed to submit node request: " + err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!profile) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError("All fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match.");
      return;
    }

    setPassLoading(true);

    try {
      // 1. Fetch user doc from Firestore
      const userRef = doc(db, "users", profile.userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setPassError("User profile not found.");
        return;
      }

      const userData = userSnap.data();

      // 2. Hash and check current password
      const hashedCurrent = await hashPasswordSHA256(currentPassword);
      if (userData.password !== hashedCurrent) {
        setPassError("Current password is incorrect.");
        return;
      }

      // 3. Hash and update new password
      const hashedNew = await hashPasswordSHA256(newPassword);
      await updateDoc(userRef, {
        password: hashedNew
      });

      setPassSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPassError("Failed to update password: " + err.message);
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-3">
          <Cpu className="w-8 h-8 text-[#7DD3FC] animate-spin" />
          <span className="text-xs text-gray-500 font-mono tracking-wider">Synchronizing secure session...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 font-body">
        <div className="text-sm text-red-400 border border-red-500/10 bg-red-500/5 px-6 py-4 rounded-xl max-w-sm text-center">
          {error || "Access Denied."}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-white underline cursor-pointer"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-body p-6 md:p-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#4D7CFE]/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#7DD3FC]/5 blur-3xl" />

      <div className="max-w-6xl mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
              <Server className="w-6 h-6 text-[#7DD3FC]" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl tracking-[0.1em] uppercase">
                OPERATOR PORTAL
              </h1>
              <p className="text-[10px] text-gray-500 tracking-wider font-mono mt-0.5">
                NODE PROFILE: {profile.userId}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 text-xs font-semibold text-red-400 rounded-lg px-4 py-2.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)]"
          >
            <LogOut className="w-4 h-4" /> DISCONNECT
          </button>
        </header>

        {/* Telemetry Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 border border-white/5 bg-[#030712]/30 flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Compute Status</span>
            <span className="text-emerald-400 font-bold text-sm tracking-wide flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active Node Grid
            </span>
          </div>

          <div className="glass-card p-5 border border-white/5 bg-[#030712]/30 flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Network Ping</span>
            <span className="text-[#7DD3FC] font-mono font-bold text-lg mt-0.5">{telemetry.latency} ms</span>
          </div>

          <div className="glass-card p-5 border border-white/5 bg-[#030712]/30 flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Compute Hashing</span>
            <span className="text-white font-mono font-bold text-lg mt-0.5">{telemetry.dataProcessed} GH/s</span>
          </div>

          <div className="glass-card p-5 border border-white/5 bg-[#030712]/30 flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Earned Credits</span>
            <span className="text-purple-400 font-mono font-bold text-lg mt-0.5">{telemetry.tokensEarned.toFixed(4)} AGS</span>
          </div>
        </section>

        {/* Details & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Node Profile Specs */}
          <div className="glass-card p-6 border border-white/10 bg-[#030712]/40 lg:col-span-1 flex flex-col gap-4">
            <h3 className="font-heading font-semibold text-sm uppercase text-white tracking-widest border-b border-white/5 pb-2">
              Operator Specifications
            </h3>
            
            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Registered Email</span>
                <span className="text-gray-300 font-medium">{profile.email}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Assigned Role</span>
                <span className="text-[#7DD3FC] font-mono uppercase">{profile.role.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Registration Date</span>
                <span className="text-gray-400 font-mono">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Network Uptime</span>
                <span className="text-emerald-400 font-mono font-bold">99.98%</span>
              </div>
            </div>
          </div>

          {/* Computing Terminal Activity */}
          <div className="glass-card p-6 border border-white/10 bg-[#030712]/20 lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="font-heading font-semibold text-sm uppercase text-white tracking-widest">
                Computing Grid Activity Logs
              </h3>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 tracking-wider">
                <Activity className="w-3.5 h-3.5 text-[#7DD3FC] animate-pulse" /> LIVE TELEMETRY
              </div>
            </div>

            <div className="bg-black/55 rounded-xl border border-white/5 p-4 font-mono text-[10px] text-gray-400 flex flex-col gap-2.5 h-56 overflow-y-auto leading-relaxed shadow-inner">
              <div className="text-emerald-500">[SYSTEM] Connection authenticated securely. Welcome to AEGIS compute grid.</div>
              <div className="text-gray-500">[SYSTEM] Allocating hardware resources (4 active compute channels).</div>
              <div className="text-gray-500">[COMPUTE] Submitting task execution results...</div>
              <div>[COMPUTE] Ping successfully sent to node registry (latency: {telemetry.latency}ms).</div>
              <div>[CREDIT] Generated compute cycle credentials (accumulated tokens: {telemetry.tokensEarned.toFixed(4)} AGS).</div>
              <div className="text-gray-600">[COMPUTE] Syncing state database schema.</div>
            </div>
          </div>

        </div>

        {/* My AI Compute Nodes Section */}
        <section className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-[#7DD3FC]" />
              <h2 className="font-heading font-bold text-lg">My AI Compute Nodes</h2>
            </div>
            <span className="text-[10px] text-gray-500 font-mono tracking-wider">
              {userNodes.length} active node{userNodes.length !== 1 ? "s" : ""}
            </span>
          </div>

          {userNodes.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">
              No registered compute nodes found. Submit a request below to join the grid.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                    <th className="py-2.5 px-4">Node Name</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4">Capabilities</th>
                    <th className="py-2.5 px-4">Latency</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {userNodes.map((node) => (
                    <tr key={node.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{node.name}</td>
                      <td className="py-3 px-4 text-gray-300 text-xs">{node.country}</td>
                      <td className="py-3 px-4 text-xs text-gray-400 max-w-xs truncate" title={node.capabilities}>
                        {node.capabilities}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-400">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          {node.latency} ms
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Online
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Node Requests Section */}
        {userRequests.length > 0 && (
          <section className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30 flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              <h2 className="font-heading font-bold text-lg">Pending Node Registrations</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                    <th className="py-2.5 px-4">Node Name</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4">GPU Specifications</th>
                    <th className="py-2.5 px-4">Submission Date</th>
                    <th className="py-2.5 px-4">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {userRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{req.name}</td>
                      <td className="py-3 px-4 text-gray-300 text-xs">{req.country}</td>
                      <td className="py-3 px-4 text-xs text-gray-400">{req.gpuSpecs}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs font-mono">{req.date}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          req.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : req.status === "rejected"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : req.status === "quarantined"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Settings and Creation Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Register Compute Node Form */}
          <div className="glass-card p-6 border border-white/10 bg-[#030712]/40 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <PlusCircle className="w-5 h-5 text-[#7DD3FC]" />
              <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider">
                Register New Compute Node
              </h3>
            </div>
            
            <form onSubmit={handleRegisterNode} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Node Identificator Name</label>
                <input
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="e.g. Operator-US-Node-1"
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Location City / Country</label>
                <input
                  value={nodeLocation}
                  onChange={(e) => setNodeLocation(e.target.value)}
                  placeholder="e.g. United States (Boston)"
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">GPU / Hardware Specifications</label>
                <input
                  value={gpuSpecs}
                  onChange={(e) => setGpuSpecs(e.target.value)}
                  placeholder="e.g. RTX 4090 | LLM Inference"
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] transition-colors"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={regLoading}
                className="rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] disabled:bg-gray-700 py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {regLoading ? "SUBMITTING..." : (
                  <>
                    <Plus className="w-4 h-4" /> SUBMIT REGISTRATION REQUEST
                  </>
                )}
              </button>
            </form>
            {regError && <p className="text-xs text-red-400 mt-1">{regError}</p>}
            {regSuccess && <p className="text-xs text-emerald-400 mt-1">{regSuccess}</p>}
          </div>

          {/* Change Password Card */}
          <div className="glass-card p-6 border border-white/10 bg-[#030712]/40 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <KeyRound className="w-5 h-5 text-purple-400" />
              <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider">
                Change Operator Password
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 characters)"
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] transition-colors"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={passLoading}
                className="rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {passLoading ? "SAVING..." : (
                  <>
                    <Lock className="w-4 h-4" /> UPDATE PASSWORD
                  </>
                )}
              </button>
            </form>
            {passError && <p className="text-xs text-red-400 mt-1">{passError}</p>}
            {passSuccess && <p className="text-xs text-emerald-400 mt-1">{passSuccess}</p>}
          </div>

        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 pt-6 text-center text-[10px] text-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7DD3FC]" />
            <span>AEGIS Decentralized Computing Protocol</span>
          </div>
          <span>Client Version 0.1.0</span>
        </footer>

      </div>
    </main>
  );
}
