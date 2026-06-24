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
      const data = {
        name: candName.trim(),
        email: candEmail.trim().toLowerCase(),
        role: candRole,
        status: candStatus,
        notes: candNotes.trim(),
        timestamp: Date.now()
      };

      await setDoc(doc(db, "talent_acquisition", id), data);
      await logActivity("ADD_CANDIDATE", `Logged candidate application: ${candName} for ${candRole}`);
      await addNotification("HR", `New talent acquisition file logged for: ${candName}`);

      setCandName("");
      setCandEmail("");
      setCandNotes("");
      alert("Candidate profile registered successfully.");
    } catch (err: any) {
      alert("Failed to log candidate: " + err.message);
    } finally {
      setSubmittingCand(false);
    }
  };

  const handleDeleteCandidate = async (id: string, name: string) => {
    if (confirm(`Remove candidate entry "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "talent_acquisition", id));
        await logActivity("DELETE_CANDIDATE", `Deleted candidate entry ${name}`);
        alert("Candidate record removed.");
      } catch (err: any) {
        alert("Failed to delete candidate: " + err.message);
      }
    }
  };

  const handleRegisterContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingContract(true);

    try {
      const id = `contract-${Date.now()}`;
      const data = {
        title: contractTitle.trim(),
        party: contractParty.trim(),
        type: contractType,
        status: contractStatus,
        timestamp: Date.now()
      };

      await setDoc(doc(db, "legal_contracts", id), data);
      await logActivity("ADD_CONTRACT", `Logged contract registry: ${contractTitle} with ${contractParty}`);
      await addNotification("LEGAL", `New corporate legal contract logged: ${contractTitle}`);

      setContractTitle("");
      setContractParty("");
      alert("Contract logged into registry successfully.");
    } catch (err: any) {
      alert("Failed to log contract: " + err.message);
    } finally {
      setSubmittingContract(false);
    }
  };

  const handleDeleteContract = async (id: string, title: string) => {
    if (confirm(`Remove contract "${title}"?`)) {
      try {
        await deleteDoc(doc(db, "legal_contracts", id));
        await logActivity("DELETE_CONTRACT", `Removed contract ${title}`);
        alert("Contract record deleted.");
      } catch (err: any) {
        alert("Failed to delete contract: " + err.message);
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
      alert("Failed to update checklist: " + err.message);
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
    <div className="p-8 flex flex-col gap-10 max-w-7xl mx-auto">
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
              Recruitment and compliance registry. HR managers and legal counsel can review applicants portfolios, registry legal contracts, and toggle compliance audits.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: HR & Legal Forms */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Compliance Checklist */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-orange-400" /> Compliance Checklists
            </h2>
            <p className="text-[10px] text-gray-400">
              Audit operational status. Keep track of compliance reviews before deployment.
            </p>

            <div className="flex flex-col gap-3 mt-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.gdprAudit}
                  disabled={updatingChecklist}
                  onChange={() => handleToggleChecklist("gdprAudit")}
                  className="w-4 h-4 rounded border-white/10 bg-black outline-none accent-orange-500"
                />
                <span className="text-xs text-gray-300">EU GDPR Data Protection Audit</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.privacyPolicy}
                  disabled={updatingChecklist}
                  onChange={() => handleToggleChecklist("privacyPolicy")}
                  className="w-4 h-4 rounded border-white/10 bg-black outline-none accent-orange-500"
                />
                <span className="text-xs text-gray-300">Public Privacy Policy Revision Sync</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.secFiling}
                  disabled={updatingChecklist}
                  onChange={() => handleToggleChecklist("secFiling")}
                  className="w-4 h-4 rounded border-white/10 bg-black outline-none accent-orange-500"
                />
                <span className="text-xs text-gray-300">SEC Financial Transparency Filing</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.nodeSecurityReview}
                  disabled={updatingChecklist}
                  onChange={() => handleToggleChecklist("nodeSecurityReview")}
                  className="w-4 h-4 rounded border-white/10 bg-black outline-none accent-orange-500"
                />
                <span className="text-xs text-gray-300">Consortium Nodes Security Review</span>
              </label>
            </div>
          </div>

          {/* Legal Contract Registry */}
          <form onSubmit={handleRegisterContract} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" /> Log Legal Contract
            </h2>
            <p className="text-[10px] text-gray-400">
              Register corporate agreements and service NDAs.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Contract Title</label>
              <input
                type="text"
                value={contractTitle}
                onChange={(e) => setContractTitle(e.target.value)}
                placeholder="e.g. Helix Master Node Licensing Agreement"
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-orange-500 text-xs text-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Counterparty Name</label>
              <input
                type="text"
                value={contractParty}
                onChange={(e) => setContractParty(e.target.value)}
                placeholder="e.g. Helix Quantum Inc."
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-orange-500 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Contract Type</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as any)}
                  className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-orange-500 text-xs text-gray-300"
                >
                  <option value="NDA">Non-Disclosure (NDA)</option>
                  <option value="License Agreement">License Agreement</option>
                  <option value="Consulting Service">Consulting Service</option>
                  <option value="Employment Contract">Employment Contract</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Status State</label>
                <select
                  value={contractStatus}
                  onChange={(e) => setContractStatus(e.target.value as any)}
                  className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-orange-500 text-xs text-gray-300"
                >
                  <option value="Draft">Draft Stage</option>
                  <option value="Active">Active / Cleared</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingContract}
              className="rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 py-2.5 text-xs font-bold transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] mt-2 cursor-pointer text-black"
            >
              {submittingContract ? "LOGGING CONTRACT..." : "LOG CONTRACT RECORD"}
            </button>
          </form>
        </div>

        {/* Right Columns: Talent Board & Contracts Ledger */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Candidates Talent Board */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-400" /> Talent Acquisition Board
              </h2>
              <span className="text-[9px] font-mono text-gray-500">{candidates.length} active files</span>
            </div>

            {/* Candidate creation inline trigger form */}
            <form onSubmit={handleRegisterCandidate} className="p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01] flex flex-col gap-3">
              <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">Log Candidate Application Entry</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  placeholder="Candidate Full Name"
                  className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                  required
                />
                <input
                  type="email"
                  value={candEmail}
                  onChange={(e) => setCandEmail(e.target.value)}
                  placeholder="Candidate Email"
                  className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={candRole}
                  onChange={(e) => setCandRole(e.target.value)}
                  placeholder="Applied Position (e.g. MLOps Engineer)"
                  className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                  required
                />
                <select
                  value={candStatus}
                  onChange={(e) => setCandStatus(e.target.value as any)}
                  className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-orange-500"
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
                placeholder="Interview notes annotations summary..."
                className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
              />

              <button
                type="submit"
                disabled={submittingCand}
                className="rounded bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-white font-bold py-1.5 text-xs uppercase tracking-wider self-start px-4 cursor-pointer"
              >
                Log Candidate
              </button>
            </form>

            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
              {candidates.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500 font-mono">
                  No recruitment applicant files logged.
                </div>
              ) : (
                candidates.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <strong className="text-white text-xs block">{c.name}</strong>
                        <span className="text-[9px] text-gray-500 font-mono">{c.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-semibold text-orange-400">{c.role}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getCandStatusColor(c.status)}`}>
                          {c.status}
                        </span>
                        <button
                          onClick={() => handleDeleteCandidate(c.id, c.name)}
                          className="p-1 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {c.notes && (
                      <p className="text-[10px] text-gray-400 leading-relaxed italic">"{c.notes}"</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Legal Contracts Directory */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2 font-body">
              <FileText className="w-4 h-4 text-orange-400" /> Legal Agreements Registry
            </h2>

            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
              {contracts.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  No legal agreements registered in vault.
                </div>
              ) : (
                contracts.map((ct) => (
                  <div key={ct.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <strong className="text-white text-xs font-heading font-body">{ct.title}</strong>
                        <span className="text-[9px] text-gray-500 block">Party: {ct.party}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] text-orange-400 border border-orange-500/10 px-1.5 py-0.5 rounded bg-orange-500/5">{ct.type}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getContractStatusColor(ct.status)}`}>
                          {ct.status}
                        </span>
                        <button
                          onClick={() => handleDeleteContract(ct.id, ct.title)}
                          className="p-1 rounded bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 cursor-pointer font-body"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
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
