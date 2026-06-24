"use client";

import { useEffect, useState } from "react";
import { Briefcase, Landmark, UserPlus, Users, MessageSquare, Award, Globe, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, updateDoc } from "firebase/firestore";
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

export default function SalesMarketingHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Lists
  const [partners, setPartners] = useState<Partner[]>([]);
  const [leads, setLeads] = useState<ContactMessage[]>([]);

  // Partner Registration form state
  const [partnerName, setPartnerName] = useState("");
  const [partnerCountry, setPartnerCountry] = useState("United States");
  const [partnerTier, setPartnerTier] = useState<"Gold" | "Strategic" | "Associate">("Associate");
  const [partnerDesc, setPartnerDesc] = useState("");
  const [submittingPartner, setSubmittingPartner] = useState(false);

  // Lead Editing State
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<"New" | "Contacted" | "Negotiation" | "Closed Deal">("New");
  const [leadNotes, setLeadNotes] = useState("");
  const [savingLead, setSavingLead] = useState(false);

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

  const handleRegisterPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingPartner(true);

    try {
      const partnerId = `partner-${Date.now()}`;
      const partnerData = {
        name: partnerName.trim(),
        country: partnerCountry,
        tier: partnerTier,
        description: partnerDesc.trim(),
        timestamp: Date.now()
      };

      await setDoc(doc(db, "partners", partnerId), partnerData);
      await logActivity("REGISTER_PARTNER", `Registered partner organization: ${partnerName} [${partnerTier}]`);
      await addNotification("SALES", `New enterprise partnership formed with ${partnerName}`);

      setPartnerName("");
      setPartnerDesc("");
      alert("Partner organization registered successfully.");
    } catch (err: any) {
      alert("Failed to register partner: " + err.message);
    } finally {
      setSubmittingPartner(false);
    }
  };

  const handleDeletePartner = async (id: string, name: string) => {
    if (confirm(`Remove partner organization "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "partners", id));
        await logActivity("DELETE_PARTNER", `Removed partner organization ${name}`);
        alert("Partner removed successfully.");
      } catch (err: any) {
        alert("Failed to delete partner: " + err.message);
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
      alert("Lead CRM details updated successfully.");
    } catch (err: any) {
      alert("Failed to update lead: " + err.message);
    } finally {
      setSavingLead(false);
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
              Collaborative portal for BDMs, Marketing Directors, and DevRel teams. Manage partner integrations, audit leads pipeline metrics, and annotate CRM notes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Register Partner Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form onSubmit={handleRegisterPartner} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-400" /> Register Partner Enterprise
            </h2>
            <p className="text-[10px] text-gray-400">
              Add corporate partner companies integrated into the AEGIS computing nodes consortium.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Helix Quantum Labs"
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-blue-500 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Country Headquarter</label>
                <input
                  type="text"
                  value={partnerCountry}
                  onChange={(e) => setPartnerCountry(e.target.value)}
                  placeholder="e.g. Switzerland"
                  className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-blue-500 text-xs text-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Partnership Tier</label>
                <select
                  value={partnerTier}
                  onChange={(e) => setPartnerTier(e.target.value as any)}
                  className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-blue-500 text-xs text-gray-300"
                >
                  <option value="Associate">Associate Tier</option>
                  <option value="Gold">Gold Tier</option>
                  <option value="Strategic">Strategic Tier</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Integration Details</label>
              <textarea
                value={partnerDesc}
                onChange={(e) => setPartnerDesc(e.target.value)}
                placeholder="Describe enterprise nodes commitments, active contacts, or marketing projects..."
                rows={3}
                className="rounded-lg bg-white/5 border border-white/10 p-3 outline-none focus:border-blue-500 text-xs text-white resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submittingPartner}
              className="rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 py-2.5 text-xs font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] mt-2 cursor-pointer text-white"
            >
              {submittingPartner ? "REGISTERING..." : "REGISTER ENTERPRISE"}
            </button>
          </form>

          {/* Partners Directory */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" /> Active Partners Directory
            </h2>

            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
              {partners.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500 font-mono">
                  No partners currently registered.
                </div>
              ) : (
                partners.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-semibold text-white text-xs">{p.name}</span>
                        <span className="text-[8px] text-gray-500 block">{p.country}</span>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getTierColor(p.tier)}`}>
                        {p.tier}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-light">{p.description}</p>
                    <button
                      onClick={() => handleDeletePartner(p.id, p.name)}
                      className="text-[9px] text-red-400 hover:text-red-300 self-end font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: CRM leads Pipeline */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
          <div>
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" /> Sales CRM Pipeline
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">
              Live feedback from public query form portals. Assign sales lifecycle statuses and append coordination notes.
            </p>
          </div>

          <div className="flex flex-col gap-4 max-h-[650px] overflow-y-auto pr-1">
            {leads.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 font-mono">
                No contact requests in CRM pool.
              </div>
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <strong className="text-white text-xs block">{lead.name}</strong>
                      <span className="text-[9px] text-gray-400 font-mono">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getLeadStatusColor(lead.status || "New")}`}>
                        {lead.status || "New"}
                      </span>
                      {editingLeadId !== lead.id && (
                        <button
                          onClick={() => handleEditLead(lead)}
                          className="p-1 rounded bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-light">{lead.message}</p>

                  {/* Sales Notes Section */}
                  {lead.salesNotes && editingLeadId !== lead.id && (
                    <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-[10px]">
                      <span className="font-bold text-blue-400 uppercase tracking-wider block text-[8px] mb-1">Sales Rep Annotation Notes</span>
                      <p className="text-gray-400 font-light italic leading-relaxed">"{lead.salesNotes}"</p>
                    </div>
                  )}

                  {/* Inline CRM editor */}
                  {editingLeadId === lead.id && (
                    <div className="p-4 rounded-lg bg-black/50 border border-white/10 flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Lead Lifecycle Status</label>
                          <select
                            value={leadStatus}
                            onChange={(e) => setLeadStatus(e.target.value as any)}
                            className="rounded bg-black border border-white/10 px-2 py-1.5 text-xs text-gray-300"
                          >
                            <option value="New">New (Untouched)</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Negotiation">In Negotiation</option>
                            <option value="Closed Deal">Closed Partnership Deal</option>
                          </select>
                        </div>
                        <div className="text-[8px] text-gray-500 flex items-end justify-end pb-2">
                          Updating pipeline state...
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Rep Annotations</label>
                        <textarea
                          value={leadNotes}
                          onChange={(e) => setLeadNotes(e.target.value)}
                          placeholder="Annotate latest engagement summary details..."
                          rows={2}
                          className="rounded bg-black border border-white/10 p-2 text-xs text-white resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingLeadId(null)}
                          className="rounded border border-white/10 px-3 py-1 text-[10px] text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveLead(lead.id)}
                          disabled={savingLead}
                          className="rounded bg-blue-500 text-white font-bold px-3 py-1 text-[10px] hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                          Save Lead Parameters
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="text-[8px] text-gray-500 text-right">
                    {new Date(lead.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
