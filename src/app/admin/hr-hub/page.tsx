"use client";

import { useEffect, useState } from "react";
import { Users, FileText, ClipboardCheck, Plus, Trash2, ShieldCheck, Mail, Briefcase, Info } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
import { getOrCreateUserProfile, UserProfile } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Review" | "Interviewing" | "Offered" | "Rejected";
  notes: string;
  timestamp: number;
}

interface Contract {
  id: string;
  title: string;
  party: string;
  type: "NDA" | "License Agreement" | "Consulting Service" | "Employment Contract";
  status: "Draft" | "Active" | "Expired";
  timestamp: number;
}

interface Checklist {
  gdprAudit: boolean;
  privacyPolicy: boolean;
  secFiling: boolean;
  nodeSecurityReview: boolean;
}

export default function HrLegalHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"talent" | "contracts" | "compliance">("talent");

  // Lists
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [checklist, setChecklist] = useState<Checklist>({
    gdprAudit: false,
    privacyPolicy: true,
    secFiling: false,
    nodeSecurityReview: false
  });

  // Candidate form state
  const [candName, setCandName] = useState("");
  const [candEmail, setCandEmail] = useState("");
  const [candRole, setCandRole] = useState("AI Researcher");
  const [candStatus, setCandStatus] = useState<"Review" | "Interviewing" | "Offered" | "Rejected">("Review");
  const [candNotes, setCandNotes] = useState("");
  const [submittingCand, setSubmittingCand] = useState(false);

  // Contract form state
  const [contractTitle, setContractTitle] = useState("");
  const [contractParty, setContractParty] = useState("");
  const [contractType, setContractType] = useState<"NDA" | "License Agreement" | "Consulting Service" | "Employment Contract">("NDA");
  const [contractStatus, setContractStatus] = useState<"Draft" | "Active" | "Expired">("Draft");
  const [submittingContract, setSubmittingContract] = useState(false);

  // Checklist state
  const [updatingChecklist, setUpdatingChecklist] = useState(false);

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

  // Sync Talent Acquisition candidates
  useEffect(() => {
    const q = query(collection(db, "talent_acquisition"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Candidate[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Candidate);
      });
      setCandidates(list);
    }, (err) => console.error("Candidates sync failed:", err));

    return unsubscribe;
  }, []);

  // Sync Legal Contracts registry
  useEffect(() => {
    const q = query(collection(db, "legal_contracts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Contract[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Contract);
      });
      setContracts(list);
    }, (err) => console.error("Contracts sync failed:", err));

    return unsubscribe;
  }, []);

  // Sync Checklist
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "site_settings", "compliance_checklist"), (docSnap) => {
      if (docSnap.exists()) {
        setChecklist(docSnap.data() as Checklist);
      } else {
        setDoc(doc(db, "site_settings", "compliance_checklist"), {
          gdprAudit: false,
          privacyPolicy: true,
          secFiling: false,
          nodeSecurityReview: false
        });
      }
    }, (err) => console.error("Checklist sync failed:", err));

    return unsubscribe;
  }, []);

  const handleRegisterCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingCand(true);

    try {
      const id = `cand-${Date.now()}`;
      await setDoc(doc(db, "talent_acquisition", id), {
        name: candName.trim(),
        email: candEmail.trim().toLowerCase(),
        role: candRole,
        status: candStatus,
        notes: candNotes.trim(),
        timestamp: Date.now()
      });

      await logActivity("ADD_CANDIDATE", `Logged candidate application: ${candName} for ${candRole}`);
      await addNotification("HR", `New recruitment applicant logged: ${candName}`);

      setCandName("");
      setCandEmail("");
      setCandNotes("");
      alert("Candidate logged successfully.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setSubmittingCand(false);
    }
  };

  const handleDeleteCandidate = async (id: string, name: string) => {
    if (confirm(`Remove candidate entry "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "talent_acquisition", id));
        await logActivity("DELETE_CANDIDATE", `Deleted candidate registry index for ${name}`);
      } catch (err: any) {
        alert("Failed: " + err.message);
      }
    }
  };

  const handleRegisterContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingContract(true);

    try {
      const id = `contract-${Date.now()}`;
      await setDoc(doc(db, "legal_contracts", id), {
        title: contractTitle.trim(),
        party: contractParty.trim(),
        type: contractType,
        status: contractStatus,
        timestamp: Date.now()
      });

      await logActivity("ADD_CONTRACT", `Logged contract: ${contractTitle} with ${contractParty}`);
      await addNotification("LEGAL", `New contract logged: ${contractTitle}`);

      setContractTitle("");
      setContractParty("");
      alert("Contract logged.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setSubmittingContract(false);
    }
  };

  const handleDeleteContract = async (id: string, title: string) => {
    if (confirm(`Remove contract "${title}"?`)) {
      try {
        await deleteDoc(doc(db, "legal_contracts", id));
      } catch (err: any) {
        alert("Failed: " + err.message);
      }
    }
  };

  const handleToggleChecklist = async (key: keyof Checklist) => {
    if (!profile) return;
    setUpdatingChecklist(true);

    const updated = {
      ...checklist,
      [key]: !checklist[key]
    };

    try {
      await setDoc(doc(db, "site_settings", "compliance_checklist"), updated, { merge: true });
      await logActivity("TOGGLE_COMPLIANCE", `Compliance checklist toggled key: ${key}`);
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setUpdatingChecklist(false);
    }
  };

  const getCandStatusColor = (s: string) => {
    switch (s) {
      case "Offered": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Rejected": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Interviewing": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getContractStatusColor = (s: string) => {
    switch (s) {
      case "Active": return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "Expired": return "text-red-400 border-red-500/20 bg-red-500/5";
      default: return "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-gray-500 animate-pulse">
        Establishing secure HR & Legal database connection...
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-10 max-w-7xl mx-auto font-body">
      {/* Header Banner */}
      <div className="relative glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-orange-950/20 to-black overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl tracking-wide text-white uppercase">
              HR & Legal Suite Hub
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Consolidated employee board. Track applicant files, monitor NDA legal vaults, and audit regulatory compliance parameters.
            </p>
          </div>
        </div>

        {/* Sub-Tab Controls */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0">
          <button
            onClick={() => setActiveSubTab("talent")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "talent" ? "bg-orange-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Talent Board
          </button>
          <button
            onClick={() => setActiveSubTab("contracts")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "contracts" ? "bg-orange-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Contracts Vault
          </button>
          <button
            onClick={() => setActiveSubTab("compliance")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "compliance" ? "bg-orange-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" /> Compliance
          </button>
        </div>
      </div>

      {/* Tab Content: Talent Board */}
      {activeSubTab === "talent" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <form onSubmit={handleRegisterCandidate} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Log Candidate Application</span>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  placeholder="Candidate Name"
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  required
                />
                <input
                  type="email"
                  value={candEmail}
                  onChange={(e) => setCandEmail(e.target.value)}
                  placeholder="Candidate Email"
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={candRole}
                  onChange={(e) => setCandRole(e.target.value)}
                  placeholder="Role (e.g. MLOps)"
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  required
                />
                <select
                  value={candStatus}
                  onChange={(e) => setCandStatus(e.target.value as any)}
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-gray-300 outline-none"
                >
                  <option value="Review">Under Review</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offer Extended</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <input
                type="text"
                value={candNotes}
                onChange={(e) => setCandNotes(e.target.value)}
                placeholder="Interview notes..."
                className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
              />
              <button type="submit" disabled={submittingCand} className="rounded bg-orange-500 hover:bg-orange-600 text-black py-2.5 text-xs font-bold transition-all cursor-pointer mt-2">
                {submittingCand ? "LOGGING..." : "LOG APPLICANT"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2 font-body">
              <Briefcase className="w-4 h-4 text-orange-400" /> Active Applicants Registry
            </h2>
            <div className="flex flex-col gap-3">
              {candidates.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2 font-body">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-white block font-heading">{c.name}</strong>
                      <span className="text-[8px] text-gray-500 font-mono">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold text-orange-400">{c.role}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getCandStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                  {c.notes && <p className="text-[10px] text-gray-400 italic">"{c.notes}"</p>}
                  <button onClick={() => handleDeleteCandidate(c.id, c.name)} className="text-[9px] text-red-400 hover:text-red-300 self-end font-semibold font-body cursor-pointer">Delete Record</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Contracts Vault */}
      {activeSubTab === "contracts" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <form onSubmit={handleRegisterContract} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" /> Log Legal Agreement
              </h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Agreement Title</label>
                <input
                  type="text"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  placeholder="e.g. Master Node licensing agreement"
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Counterparty Name</label>
                <input
                  type="text"
                  value={contractParty}
                  onChange={(e) => setContractParty(e.target.value)}
                  placeholder="e.g. Helix Quantum Group"
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Agreement Type</label>
                  <select value={contractType} onChange={(e) => setContractType(e.target.value as any)} className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-gray-300 outline-none">
                    <option value="NDA">NDA</option>
                    <option value="License Agreement">License Agreement</option>
                    <option value="Consulting Service">Consulting Service</option>
                    <option value="Employment Contract">Employment Contract</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Status</label>
                  <select value={contractStatus} onChange={(e) => setContractStatus(e.target.value as any)} className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-gray-300 outline-none">
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={submittingContract} className="rounded bg-orange-500 hover:bg-orange-600 text-black py-2.5 text-xs font-bold transition-all cursor-pointer">
                {submittingContract ? "LOGGING..." : "LOG AGREEMENT"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2 font-body">
              <ShieldCheck className="w-4 h-4 text-orange-400" /> Legal Agreements Vault
            </h2>
            <div className="flex flex-col gap-3">
              {contracts.map((ct) => (
                <div key={ct.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2 font-body">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-white block font-heading">{ct.title}</strong>
                      <span className="text-[8px] text-gray-500 font-mono">Party: {ct.party}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-orange-400 border border-orange-500/10 px-1.5 py-0.5 rounded bg-orange-500/5">{ct.type}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getContractStatusColor(ct.status)}`}>
                        {ct.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteContract(ct.id, ct.title)} className="text-[9px] text-red-400 hover:text-red-300 self-end font-semibold font-mono cursor-pointer">Delete Contract</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Compliance */}
      {activeSubTab === "compliance" && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 max-w-xl mx-auto w-full">
          <div>
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-orange-400" /> Operational Compliance Checklists
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">Audit enclaves status parameters to verify regulatory alignment.</p>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer">
              <input type="checkbox" checked={checklist.gdprAudit} disabled={updatingChecklist} onChange={() => handleToggleChecklist("gdprAudit")} className="accent-orange-500 w-4 h-4 bg-black rounded" />
              <span className="text-xs text-gray-300">EU GDPR Data Protection compliance Audit</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer">
              <input type="checkbox" checked={checklist.privacyPolicy} disabled={updatingChecklist} onChange={() => handleToggleChecklist("privacyPolicy")} className="accent-orange-500 w-4 h-4 bg-black rounded" />
              <span className="text-xs text-gray-300">Public Privacy Policy Revision Sync</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer">
              <input type="checkbox" checked={checklist.secFiling} disabled={updatingChecklist} onChange={() => handleToggleChecklist("secFiling")} className="accent-orange-500 w-4 h-4 bg-black rounded" />
              <span className="text-xs text-gray-300">SEC Financial Transparency Filing</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer">
              <input type="checkbox" checked={checklist.nodeSecurityReview} disabled={updatingChecklist} onChange={() => handleToggleChecklist("nodeSecurityReview")} className="accent-orange-500 w-4 h-4 bg-black rounded" />
              <span className="text-xs text-gray-300">Consortium Nodes Security Review</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
