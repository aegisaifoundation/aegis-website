"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Shield, UserX, ToggleLeft, ToggleRight, Check } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { getOrCreateUserProfile, UserProfile, UserRole } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";

// Helper to hash password client-side using Web Crypto
async function hashPasswordSHA256(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function AdminUsersDirectory() {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State & Network Users
  const [activeTab, setActiveTab] = useState<"admins" | "network">("admins");
  const [networkUsers, setNetworkUsers] = useState<UserProfile[]>([]);

  // Add User Form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("viewer");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Fetch Current Logged-in user profile
  useEffect(() => {
    async function loadCurrent() {
      const user = auth.currentUser;
      if (user) {
        const prof = await getOrCreateUserProfile(user.uid, user.email || "");
        setCurrentUserProfile(prof);
      }
    }
    loadCurrent();
  }, []);

  // Sync Admins Collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "admins"), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((d) => {
        list.push({ uid: d.id, ...d.data() } as UserProfile);
      });
      setUsers(list);
      setLoading(false);
    }, (err) => {
      console.error("Admins list sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sync Network Users (public operators)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((d) => {
        list.push({ uid: d.id, ...d.data() } as UserProfile);
      });
      setNetworkUsers(list);
    }, (err) => {
      console.error("Network users list sync failed:", err);
    });

    return unsubscribe;
  }, []);

  const handleRemoveNetworkUser = async (uid: string, email: string) => {
    if (!currentUserProfile || currentUserProfile.role !== "super_admin") {
      alert("Permission Denied. Only Super Admins can delete network users.");
      return;
    }

    if (confirm(`Are you sure you want to completely remove operator "${email}" from the network? This will also delete all their computing nodes and disconnect active sessions.`)) {
      try {
        // 1. Delete from users collection
        await deleteDoc(doc(db, "users", uid));

        // 2. Clear sessions
        const sessionsSnap = await getDocs(query(collection(db, "sessions"), where("userId", "==", uid)));
        const batch = writeBatch(db);
        sessionsSnap.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        // 3. Delete registered nodes
        const nodesSnap = await getDocs(query(collection(db, "nodes"), where("ownerId", "==", uid)));
        const nodesBatch = writeBatch(db);
        nodesSnap.docs.forEach((doc) => {
          nodesBatch.delete(doc.ref);
        });
        await nodesBatch.commit();

        alert(`Successfully removed network operator ${email} and cleaned up their telemetry nodes/sessions.`);
        await logActivity("DELETE_NETWORK_USER", `Completely deleted node operator ${email} and associated nodes.`);
      } catch (err: any) {
        alert("Failed to delete network user: " + err.message);
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!currentUserProfile || (currentUserProfile.role !== "super_admin" && currentUserProfile.role !== "admin")) {
      setFormError("Permission Denied. Only Admins can add users.");
      return;
    }

    const email = newEmail.trim().toLowerCase();
    if (!email) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    // Check if user already exists in local list
    if (users.some((u) => u.email.toLowerCase() === email)) {
      setFormError("A user with this email address already exists.");
      return;
    }

    try {
      const docId = email.replace(/[^a-zA-Z0-9]/g, "_");
      const userRef = doc(db, "admins", docId);
      const hashedPassword = await hashPasswordSHA256(newPassword);
      
      const newProfile: UserProfile = {
        uid: docId,
        email,
        role: newRole,
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: "Never logged in",
        password: hashedPassword,
      };

      await setDoc(userRef, newProfile);
      setFormSuccess(`Admin user ${email} has been added as a ${newRole}.`);
      setNewEmail("");
      setNewPassword("");
      setNewRole("viewer");
      
      await logActivity("ADD_USER", `Added admin authorization for ${email} with role ${newRole}`);
      await addNotification("USER_INVITED", `Admin authorization created for ${email} (${newRole})`);
    } catch (err: any) {
      setFormError(err.message || "Failed to create user.");
    }
  };

  const handleChangeRole = async (uid: string, email: string, role: UserRole) => {
    if (!currentUserProfile || (currentUserProfile.role !== "super_admin" && currentUserProfile.role !== "admin")) {
      alert("Permission Denied.");
      return;
    }

    try {
      const userRef = doc(db, "admins", uid);
      await updateDoc(userRef, { role });
      alert(`Successfully updated role for ${email} to ${role}`);
      await logActivity("CHANGE_ROLE", `Changed role of ${email} to ${role}`);
    } catch (err: any) {
      alert("Failed to update role: " + err.message);
    }
  };

  const handleToggleStatus = async (uid: string, email: string, currentStatus: "active" | "disabled") => {
    if (!currentUserProfile || (currentUserProfile.role !== "super_admin" && currentUserProfile.role !== "admin")) {
      alert("Permission Denied.");
      return;
    }

    const nextStatus = currentStatus === "active" ? "disabled" : "active";

    try {
      const userRef = doc(db, "admins", uid);
      await updateDoc(userRef, { status: nextStatus });
      alert(`User ${email} is now ${nextStatus}`);
      await logActivity("TOGGLE_STATUS", `Toggled user status of ${email} to ${nextStatus}`);
      await addNotification("USER_STATUS_CHANGE", `User ${email} status changed to ${nextStatus}`);
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleRemoveUser = async (uid: string, email: string) => {
    if (!currentUserProfile || currentUserProfile.role !== "super_admin") {
      alert("Permission Denied. Only Super Admins can delete users.");
      return;
    }

    if (confirm(`Are you sure you want to completely remove ${email}?`)) {
      try {
        await deleteDoc(doc(db, "admins", uid));
        alert(`Successfully removed user ${email}`);
        await logActivity("DELETE_USER", `Removed user access for ${email}`);
      } catch (err: any) {
        alert("Failed to delete user: " + err.message);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      super_admin: "bg-red-500/10 text-red-400 border-red-500/20",
      admin: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      co_admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      editor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      reviewer: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      viewer: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      node_auditor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      billing_manager: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      research_director: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      support_agent: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      security_officer: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      data_curator: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
      devrel_manager: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      governance_delegate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      infrastructure_operator: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      compliance_counsel: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
    return styles[role] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  const isAuthorized = currentUserProfile && (currentUserProfile.role === "super_admin" || currentUserProfile.role === "admin");

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 font-body">
      {/* Header */}
      <header className="border-b border-white/10 pb-6">
        <h1 className="font-heading font-bold text-3xl">Admin Directory</h1>
        <p className="text-sm text-gray-500 mt-1">Manage administrative permissions, invite new staff, and adjust roles.</p>
      </header>

      {/* Add User Panel */}
      {isAuthorized && (
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <UserPlus className="w-5 h-5 text-[#7DD3FC]" />
            <h2 className="font-heading font-bold text-lg">Add New Authorized Admin</h2>
          </div>

          <form onSubmit={handleAddUser} className="grid md:grid-cols-5 gap-4 items-end">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@aegis.com"
                className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Initial Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Select Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] cursor-pointer"
              >
                <option value="viewer">Viewer (Read Only)</option>
                <option value="support_agent">Support Agent (Helpdesk)</option>
                <option value="reviewer">Reviewer (Approve Changes)</option>
                <option value="compliance_counsel">Compliance Counsel (Privacy)</option>
                <option value="data_curator">Data Curator (Pipelines)</option>
                <option value="editor">Editor (Write Content)</option>
                <option value="research_director">Research Director (Models)</option>
                <option value="devrel_manager">DevRel Manager (APIs)</option>
                <option value="node_auditor">Node Auditor (Compliance)</option>
                <option value="billing_manager">Billing Manager (Finance)</option>
                <option value="governance_delegate">Governance Delegate (DAO)</option>
                <option value="security_officer">Security Officer (Keys)</option>
                <option value="co_admin">Co-Admin</option>
                <option value="infrastructure_operator">Infrastructure Operator (DevOps)</option>
                <option value="admin">Admin (Website + Nodes)</option>
                <option value="super_admin">Super Admin (Full Access)</option>
              </select>
            </div>

            <button className="rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer h-[42px] flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" /> AUTHORIZE USER
            </button>
          </form>
          {formError && <p className="text-xs text-red-400 mt-1">{formError}</p>}
          {formSuccess && <p className="text-xs text-emerald-400 mt-1">{formSuccess}</p>}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("admins")}
          className={`text-xs font-bold tracking-widest uppercase pb-2 px-1 border-b-2 transition-all cursor-pointer ${
            activeTab === "admins"
              ? "border-[#4D7CFE] text-white"
              : "border-transparent text-gray-500 hover:text-white"
          }`}
        >
          Administrators
        </button>
        <button
          onClick={() => setActiveTab("network")}
          className={`text-xs font-bold tracking-widest uppercase pb-2 px-1 border-b-2 transition-all cursor-pointer ${
            activeTab === "network"
              ? "border-[#4D7CFE] text-white"
              : "border-transparent text-gray-500 hover:text-white"
          }`}
        >
          Network Operators
        </button>
      </div>

      {/* Directory Table */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
          <Users className="w-5 h-5 text-[#7DD3FC]" />
          <h2 className="font-heading font-bold text-lg">
            {activeTab === "admins" ? "System Admins" : "Decentralized Operators"}
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing user database...</div>
        ) : (activeTab === "admins" ? users : networkUsers).length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">
            No users registered in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  {activeTab === "admins" && <th className="py-3 px-4">Last Activity</th>}
                  {isAuthorized && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(activeTab === "admins" ? users : networkUsers).map((u) => {
                  const isSelf = auth.currentUser?.email === u.email;
                  return (
                    <tr key={u.uid} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4 font-medium text-white">
                        <span>{u.email}</span>
                        {isSelf && <span className="text-[9px] text-[#7DD3FC] font-bold uppercase ml-2 bg-blue-500/10 px-1 rounded">Self</span>}
                      </td>
                      <td className="py-4 px-4">
                        {activeTab === "admins" && isAuthorized && !isSelf && u.role !== "super_admin" ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.uid, u.email, e.target.value as UserRole)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="support_agent">Support Agent</option>
                            <option value="reviewer">Reviewer</option>
                            <option value="compliance_counsel">Compliance Counsel</option>
                            <option value="data_curator">Data Curator</option>
                            <option value="editor">Editor</option>
                            <option value="research_director">Research Director</option>
                            <option value="devrel_manager">DevRel Manager</option>
                            <option value="node_auditor">Node Auditor</option>
                            <option value="billing_manager">Billing Manager</option>
                            <option value="governance_delegate">Governance Delegate</option>
                            <option value="security_officer">Security Officer</option>
                            <option value="co_admin">Co-Admin</option>
                            <option value="infrastructure_operator">Infrastructure Operator</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        ) : (
                          <span className={`inline-block border text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getRoleBadge(u.role || "node_operator")}`}>
                            {(u.role || "node_operator").replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          u.status === "active" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
                          {u.status === "active" ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 font-mono text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      {activeTab === "admins" && (
                        <td className="py-4 px-4 text-gray-400 font-mono text-xs">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}
                        </td>
                      )}
                      {isAuthorized && (
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle status */}
                            {!isSelf && u.role !== "super_admin" && activeTab === "admins" && (
                              <button
                                onClick={() => handleToggleStatus(u.uid, u.email, u.status)}
                                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                title={u.status === "active" ? "Disable user" : "Enable user"}
                              >
                                {u.status === "active" ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-gray-500" />}
                              </button>
                            )}
                            
                            {/* Delete User */}
                            {!isSelf && u.role !== "super_admin" && currentUserProfile?.role === "super_admin" && (
                              <button
                                onClick={() => {
                                  if (activeTab === "admins") {
                                    handleRemoveUser(u.uid, u.email);
                                  } else {
                                    handleRemoveNetworkUser(u.uid, u.email);
                                  }
                                }}
                                className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Remove User Profile"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
