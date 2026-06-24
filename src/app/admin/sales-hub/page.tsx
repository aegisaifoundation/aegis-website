"use client";

import { useEffect, useState } from "react";
import { Briefcase, Landmark, UserPlus, Users, MessageSquare, Award, Globe, Edit, Trash2, CheckCircle2, FileText, Plus } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, updateDoc, addDoc } from "firebase/firestore";
import { getOrCreateUserProfile, UserProfile } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";

interface Partner {
  id: string;
  name: string;
  country: string;
  tier: "Gold" | "Strategic" | "Associate";
  description: string;
  timestamp: number;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status?: "New" | "Contacted" | "Negotiation" | "Closed Deal";
  salesNotes?: string;
  timestamp: number;
}

interface PrDraft {
  id: string;
  title: string;
  platform: "Blog" | "Twitter" | "Medium" | "Newsletter";
  body: string;
  status: "Draft" | "Pending Review" | "Approved";
  author: string;
  timestamp: number;
}

export default function SalesMarketingHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"partners" | "crm" | "pr_drafts">("partners");

  // Lists
  const [partners, setPartners] = useState<Partner[]>([]);
  const [leads, setLeads] = useState<ContactMessage[]>([]);
  const [prDrafts, setPrDrafts] = useState<PrDraft[]>([]);

  // Partner Registration form state
  const [partnerName, setPartnerName] = useState("");
  const [partnerCountry, setPartnerCountry] = useState("United States");
  const [partnerTier, setPartnerTier] = useState<"Gold" | "Strategic" | "Associate">("Associate");
  const [partnerDesc, setPartnerDesc] = useState("");
  const [submittingPartner, setSubmittingPartner] = useState(false);

  // CRM Lead Editing State
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<"New" | "Contacted" | "Negotiation" | "Closed Deal">("New");
  const [leadNotes, setLeadNotes] = useState("");
  const [savingLead, setSavingLead] = useState(false);

  // PR Drafts form state
  const [prTitle, setPrTitle] = useState("");
  const [prPlatform, setPrPlatform] = useState<"Blog" | "Twitter" | "Medium" | "Newsletter">("Blog");
  const [prBody, setPrBody] = useState("");
  const [prStatus, setPrStatus] = useState<"Draft" | "Pending Review" | "Approved">("Draft");
  const [submittingPr, setSubmittingPr] = useState(false);

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

  // Sync Partners
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "partners"), (snapshot) => {
      const list: Partner[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Partner);
      });
      setPartners(list);
    }, (err) => console.error("Partners sync failed:", err));

    return unsubscribe;
  }, []);

  // Sync Contact Messages (Leads)
  useEffect(() => {
    const q = query(collection(db, "contact_messages"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ContactMessage[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ContactMessage);
      });
      setLeads(list);
    }, (err) => console.error("Leads sync failed:", err));

    return unsubscribe;
  }, []);

  // Sync PR Drafts
  useEffect(() => {
    const q = query(collection(db, "pr_drafts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: PrDraft[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as PrDraft);
      });
      setPrDrafts(list);
    }, (err) => console.error("PR drafts sync failed:", err));

    return unsubscribe;
  }, []);

  const handleRegisterPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingPartner(true);

    try {
      const partnerId = `partner-${Date.now()}`;
      await setDoc(doc(db, "partners", partnerId), {
        name: partnerName.trim(),
        country: partnerCountry,
        tier: partnerTier,
        description: partnerDesc.trim(),
        timestamp: Date.now()
      });

      await logActivity("REGISTER_PARTNER", `Registered partner: ${partnerName} [${partnerTier}]`);
      await addNotification("SALES", `New partnership formed with ${partnerName}`);

      setPartnerName("");
      setPartnerDesc("");
      alert("Partner registered.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setSubmittingPartner(false);
    }
  };

  const handleDeletePartner = async (id: string, name: string) => {
    if (confirm(`Remove partner organization "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "partners", id));
        await logActivity("DELETE_PARTNER", `Removed partner ${name}`);
      } catch (err: any) {
        alert("Failed: " + err.message);
      }
    }
  };

  const handleEditLead = (lead: ContactMessage) => {
    setEditingLeadId(lead.id);
    setLeadStatus(lead.status || "New");
    setLeadNotes(lead.salesNotes || "");
  };

  const handleSaveLead = async (id: string) => {
    if (!profile) return;
    setSavingLead(true);

    try {
      await updateDoc(doc(db, "contact_messages", id), {
        status: leadStatus,
        salesNotes: leadNotes.trim()
      });

      await logActivity("UPDATE_LEAD_STATUS", `CRM Updated Lead ${id} status to ${leadStatus}`);
      setEditingLeadId(null);
      alert("Lead updated.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setSavingLead(false);
    }
  };

  const handleCreatePrDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingPr(true);

    try {
      const id = `pr-${Date.now()}`;
      await setDoc(doc(db, "pr_drafts", id), {
        id,
        title: prTitle.trim(),
        platform: prPlatform,
        body: prBody.trim(),
        status: prStatus,
        author: profile.email,
        timestamp: Date.now()
      });

      await logActivity("CREATE_PR_DRAFT", `PR Announcement Draft posted: "${prTitle}" for ${prPlatform}`);
      await addNotification("MARKETING", `New PR release draft logged for ${prPlatform}: "${prTitle}"`);

      setPrTitle("");
      setPrBody("");
      alert("PR Draft logged.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setSubmittingPr(false);
    }
  };

  const handleDeletePr = async (id: string, name: string) => {
    if (confirm(`Delete PR Draft "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "pr_drafts", id));
        await logActivity("DELETE_PR_DRAFT", `Deleted PR Draft: ${name}`);
      } catch (err: any) {
        alert("Failed: " + err.message);
      }
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Strategic": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Gold": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case "Closed Deal": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Negotiation": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Contacted": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-gray-500 animate-pulse">
        Initializing Sales & Marketing Hub parameters...
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-10 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-blue-950/20 to-black overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl tracking-wide text-white uppercase">
              Sales & Marketing Hub
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Consolidated business office workspace. Manage integrations, monitor pipeline leads, and compose marketing campaigns enclaves.
            </p>
          </div>
        </div>

        {/* Sub-Tab Controls */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0 font-body">
          <button
            onClick={() => setActiveSubTab("partners")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "partners" ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Landmark className="w-3.5 h-3.5" /> Partners
          </button>
          <button
            onClick={() => setActiveSubTab("crm")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "crm" ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> CRM Leads ({leads.filter(l => !l.status || l.status === "New").length})
          </button>
          <button
            onClick={() => setActiveSubTab("pr_drafts")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "pr_drafts" ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> PR Drafts
          </button>
        </div>
      </div>

      {/* Tab Content: Partners */}
      {activeSubTab === "partners" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <form onSubmit={handleRegisterPartner} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-400" /> Register Partner Enterprise
              </h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Helix Quantum Labs"
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    value={partnerCountry}
                    onChange={(e) => setPartnerCountry(e.target.value)}
                    className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Tier</label>
                  <select
                    value={partnerTier}
                    onChange={(e) => setPartnerTier(e.target.value as any)}
                    className="rounded bg-[#030712] border border-white/10 px-3 py-2 text-xs text-gray-300 outline-none"
                  >
                    <option value="Associate">Associate</option>
                    <option value="Gold">Gold</option>
                    <option value="Strategic">Strategic</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Description</label>
                <textarea
                  value={partnerDesc}
                  onChange={(e) => setPartnerDesc(e.target.value)}
                  placeholder="Details..."
                  rows={3}
                  className="rounded bg-black border border-white/10 p-3 text-xs text-white resize-none"
                  required
                />
              </div>
              <button type="submit" disabled={submittingPartner} className="rounded bg-blue-500 hover:bg-blue-600 text-white py-2.5 text-xs font-bold transition-all cursor-pointer">
                {submittingPartner ? "REGISTERING..." : "REGISTER"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2 font-body">
              <Award className="w-4 h-4 text-blue-400" /> Consortium Partners Directory
            </h2>
            <div className="flex flex-col gap-3">
              {partners.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-semibold text-white text-xs block">{p.name}</span>
                      <span className="text-[8px] text-gray-500">{p.country}</span>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${getTierColor(p.tier)}`}>
                      {p.tier}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-light leading-normal">{p.description}</p>
                  <button onClick={() => handleDeletePartner(p.id, p.name)} className="text-[9px] text-red-400 hover:text-red-300 self-end font-semibold font-body cursor-pointer">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: CRM Leads */}
      {activeSubTab === "crm" && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 max-w-5xl mx-auto w-full">
          <div>
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" /> Sales CRM Leads pipeline
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">Select any contact query to update pipeline status parameters.</p>
          </div>
          <div className="flex flex-col gap-4">
            {leads.map((lead) => (
              <div key={lead.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <strong className="text-white text-xs block">{lead.name}</strong>
                    <span className="text-[9px] text-gray-500 font-mono">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${getLeadStatusColor(lead.status || "New")}`}>
                      {lead.status || "New"}
                    </span>
                    {editingLeadId !== lead.id && (
                      <button onClick={() => handleEditLead(lead)} className="p-1 rounded bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-all cursor-pointer">
                        <Edit className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-normal">{lead.message}</p>
                {lead.salesNotes && editingLeadId !== lead.id && (
                  <div className="p-3 bg-black/40 border border-white/5 rounded text-[10px] text-gray-400 italic">
                    Rep notes: "{lead.salesNotes}"
                  </div>
                )}

                {editingLeadId === lead.id && (
                  <div className="p-4 rounded bg-black/50 border border-white/10 flex flex-col gap-3 font-body">
                    <div className="flex gap-4">
                      <select value={leadStatus} onChange={(e) => setLeadStatus(e.target.value as any)} className="rounded bg-black border border-white/10 px-2 py-1 text-xs text-gray-300">
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed Deal">Closed Deal</option>
                      </select>
                      <button onClick={() => handleSaveLead(lead.id)} disabled={savingLead} className="rounded bg-blue-500 text-white font-bold px-3 py-1 text-[10px] hover:bg-blue-600 transition-colors cursor-pointer">Save Lead Status</button>
                      <button onClick={() => setEditingLeadId(null)} className="text-xs text-gray-400">Cancel</button>
                    </div>
                    <textarea value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)} placeholder="Append notes..." rows={2} className="rounded bg-black border border-white/10 p-2 text-xs text-white resize-none" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: PR Drafts */}
      {activeSubTab === "pr_drafts" && (
        <div className="grid lg:grid-cols-3 gap-8 items-start font-body">
          <form onSubmit={handleCreatePrDraft} className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" /> Create PR Draft
            </h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Release Title</label>
              <input
                type="text"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                placeholder="Title..."
                className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Platform</label>
                <select
                  value={prPlatform}
                  onChange={(e) => setPrPlatform(e.target.value as any)}
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-gray-300 outline-none"
                >
                  <option value="Blog">Official Blog</option>
                  <option value="Twitter">Twitter/X</option>
                  <option value="Medium">Medium</option>
                  <option value="Newsletter">Newsletter</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Status</label>
                <select
                  value={prStatus}
                  onChange={(e) => setPrStatus(e.target.value as any)}
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-gray-300 outline-none"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Body Announcement details</label>
              <textarea
                value={prBody}
                onChange={(e) => setPrBody(e.target.value)}
                placeholder="PR Content..."
                rows={4}
                className="rounded bg-black border border-white/10 p-3 text-xs text-white resize-none"
                required
              />
            </div>
            <button type="submit" disabled={submittingPr} className="rounded bg-blue-500 hover:bg-blue-600 text-white py-2.5 text-xs font-bold transition-all cursor-pointer">
              {submittingPr ? "LOGGING..." : "LOG DRAFT"}
            </button>
          </form>

          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs">
            <h2 className="font-heading font-bold text-sm text-white flex items-center gap-2 font-body">
              <FileText className="w-4 h-4 text-blue-400" /> Active PR & Announcements drafts
            </h2>
            <div className="flex flex-col gap-3">
              {prDrafts.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">No PR drafts.</div>
              ) : (
                prDrafts.map((pr) => (
                  <div key={pr.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2 font-body">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white block font-heading">{pr.title}</strong>
                        <span className="text-[8px] text-gray-500 uppercase font-mono">Platform: {pr.platform}</span>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        pr.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        pr.status === "Pending Review" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {pr.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 font-light leading-normal">{pr.body}</p>
                    <div className="flex justify-between items-center text-[8px] text-gray-500 border-t border-white/5 pt-2">
                      <span>Author: {pr.author}</span>
                      <span>{new Date(pr.timestamp).toLocaleDateString()}</span>
                      <button onClick={() => handleDeletePr(pr.id, pr.title)} className="text-red-400 hover:text-red-300 font-bold cursor-pointer">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
