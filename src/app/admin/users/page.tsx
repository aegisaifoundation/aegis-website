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
    let style = "bg-gray-500/10 text-gray-400 border-gray-500/20";
    
    const reds = ["super_admin", "ceo", "cto", "cfo", "coo", "cmo", "chro", "ciso", "cro", "cpo"];
    const blues = ["admin", "co_admin", "vp_engineering", "engineering_manager", "project_manager", "program_manager", "operations_manager"];
    const purples = ["editor", "reviewer", "content_writer", "brand_manager", "marketing_director", "digital_marketing_specialist"];
    const cyans = ["chief_ai_officer", "ai_researcher", "ml_engineer", "federated_learning_engineer", "llm_engineer", "data_scientist", "mlops_engineer", "research_intern"];
    const emeralds = ["backend_developer", "frontend_developer", "fullstack_developer", "mobile_developer", "devops_engineer", "qa_engineer", "system_engineer"];
    const ambers = ["cloud_architect", "sre", "kubernetes_engineer", "network_engineer", "database_administrator", "infrastructure_operator"];
    const pinks = ["product_manager", "product_owner", "business_analyst", "ux_researcher", "devrel_manager"];
    const teals = ["security_architect", "penetration_tester", "soc_analyst", "compliance_officer", "privacy_officer", "security_officer", "node_auditor"];
    const yellow = ["finance_manager", "accountant", "financial_analyst", "payroll_team", "investor_relations", "billing_manager"];
    const orange = ["hr_manager", "recruiter", "talent_acquisition_specialist", "learning_development_team", "employee_relations_team"];
    const rose = ["general_counsel", "legal_officer", "contract_manager", "compliance_manager", "data_protection_officer", "compliance_counsel"];
    const fuchsias = ["researcher", "research_manager", "research_director", "data_curator"];

    if (reds.includes(role)) style = "bg-red-500/10 text-red-400 border-red-500/20";
    else if (blues.includes(role)) style = "bg-blue-500/10 text-blue-400 border-blue-500/20";
    else if (purples.includes(role)) style = "bg-purple-500/10 text-purple-400 border-purple-500/20";
    else if (cyans.includes(role)) style = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    else if (emeralds.includes(role)) style = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    else if (ambers.includes(role)) style = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    else if (pinks.includes(role)) style = "bg-pink-500/10 text-pink-400 border-pink-500/20";
    else if (teals.includes(role)) style = "bg-teal-500/10 text-teal-400 border-teal-500/20";
    else if (yellow.includes(role)) style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    else if (orange.includes(role)) style = "bg-orange-500/10 text-orange-400 border-orange-500/20";
    else if (rose.includes(role)) style = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    else if (fuchsias.includes(role)) style = "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20";

    return style;
  };

  const isAuthorized = currentUserProfile && (currentUserProfile.role === "super_admin" || currentUserProfile.role === "admin");

  const ROLES_LIST = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "co_admin", label: "Co-Admin" },
    // Executive Leadership
    { value: "ceo", label: "CEO" },
    { value: "cto", label: "CTO" },
    { value: "coo", label: "COO" },
    { value: "cfo", label: "CFO" },
    { value: "cmo", label: "CMO" },
    { value: "chro", label: "CHRO" },
    { value: "ciso", label: "CISO" },
    // Technology
    { value: "chief_ai_officer", label: "Chief AI Officer" },
    { value: "vp_engineering", label: "VP Engineering" },
    { value: "engineering_manager", label: "Engineering Manager" },
    { value: "ai_researcher", label: "AI Research Scientist" },
    { value: "ml_engineer", label: "Machine Learning Engineer" },
    { value: "federated_learning_engineer", label: "Federated Learning Engineer" },
    { value: "llm_engineer", label: "LLM Engineer" },
    { value: "data_scientist", label: "Data Scientist" },
    { value: "mlops_engineer", label: "MLOps Engineer" },
    { value: "backend_developer", label: "Backend Developer" },
    { value: "frontend_developer", label: "Frontend Developer" },
    { value: "fullstack_developer", label: "Full Stack Developer" },
    { value: "mobile_developer", label: "Mobile Developer" },
    { value: "devops_engineer", label: "DevOps Engineer" },
    { value: "qa_engineer", label: "QA Engineer" },
    { value: "cloud_architect", label: "Cloud Architect" },
    { value: "sre", label: "SRE" },
    { value: "kubernetes_engineer", label: "Kubernetes Engineer" },
    { value: "network_engineer", label: "Network Engineer" },
    { value: "database_administrator", label: "Database Administrator" },
    { value: "system_engineer", label: "System Engineer" },
    // Product
    { value: "cpo", label: "Chief Product Officer" },
    { value: "product_manager", label: "Product Manager" },
    { value: "product_owner", label: "Product Owner" },
    { value: "business_analyst", label: "Business Analyst" },
    { value: "ux_researcher", label: "UX Researcher" },
    // Security
    { value: "security_architect", label: "Security Architect" },
    { value: "penetration_tester", label: "Penetration Tester" },
    { value: "soc_analyst", label: "SOC Analyst" },
    { value: "compliance_officer", label: "Compliance Officer" },
    { value: "privacy_officer", label: "Privacy Officer" },
    // Sales & Business Development
    { value: "cro", label: "Chief Revenue Officer" },
    { value: "enterprise_sales_manager", label: "Enterprise Sales Manager" },
    { value: "solution_architect", label: "Solution Architect" },
    { value: "business_development_manager", label: "Business Development Manager" },
    { value: "account_manager", label: "Account Manager" },
    // Marketing
    { value: "marketing_director", label: "Marketing Director" },
    { value: "digital_marketing_specialist", label: "Digital Marketing Specialist" },
    { value: "content_writer", label: "Content Writer" },
    { value: "brand_manager", label: "Brand Manager" },
    { value: "community_manager", label: "Community Manager" },
    // Operations
    { value: "operations_manager", label: "Operations Manager" },
    { value: "program_manager", label: "Program Manager" },
    { value: "project_manager", label: "Project Manager" },
    { value: "vendor_management", label: "Vendor Management" },
    { value: "procurement_team", label: "Procurement Team" },
    // Finance
    { value: "finance_manager", label: "Finance Manager" },
    { value: "accountant", label: "Accountant" },
    { value: "financial_analyst", label: "Financial Analyst" },
    { value: "payroll_team", label: "Payroll Team" },
    { value: "investor_relations", label: "Investor Relations" },
    // HR
    { value: "hr_manager", label: "HR Manager" },
    { value: "recruiter", label: "Recruiter" },
    { value: "talent_acquisition_specialist", label: "Talent Acquisition Specialist" },
    { value: "learning_development_team", label: "Learning & Development Team" },
    { value: "employee_relations_team", label: "Employee Relations Team" },
    // Legal
    { value: "general_counsel", label: "General Counsel" },
    { value: "legal_officer", label: "Legal Officer" },
    { value: "contract_manager", label: "Contract Manager" },
    { value: "compliance_manager", label: "Compliance Manager" },
    { value: "data_protection_officer", label: "Data Protection Officer" },
    // Legacy / Other
    { value: "editor", label: "Editor" },
    { value: "reviewer", label: "Reviewer" },
    { value: "viewer", label: "Viewer" },
    { value: "node_auditor", label: "Node Auditor" },
    { value: "billing_manager", label: "Billing Manager" },
    { value: "research_director", label: "Research Director" },
    { value: "support_agent", label: "Support Agent" },
    { value: "security_officer", label: "Security Officer" },
    { value: "data_curator", label: "Data Curator" },
    { value: "devrel_manager", label: "DevRel Manager" },
    { value: "governance_delegate", label: "Governance Delegate" },
    { value: "infrastructure_operator", label: "Infrastructure Operator" },
    { value: "compliance_counsel", label: "Compliance Counsel" },
    { value: "researcher", label: "Researcher" },
    { value: "research_manager", label: "Research Manager" }
  ];

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
                {ROLES_LIST.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
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
                            {ROLES_LIST.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
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
