"use client";

import { useState, useEffect } from "react";
import { Briefcase, Plus, Trash2, ShieldAlert, Check, RefreshCw, Mail } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { logActivity } from "@/config/activityLogger";

interface PartnerOrganization {
  id: string;
  name: string;
  email: string;
  scope: string;
  nodesCount: number;
  slaTier: "tier_1" | "tier_2" | "tier_3";
  status: "active" | "inactive";
  createdAt: string;
  timestamp: number;
}

export default function AdminPartnersDirectory() {
  const [partners, setPartners] = useState<PartnerOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [scope, setScope] = useState("Healthcare / Clinical Diagnostics");
  const [nodesCount, setNodesCount] = useState(1);
  const [slaTier, setSlaTier] = useState<"tier_1" | "tier_2" | "tier_3">("tier_2");

  // Sync Partners from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "partners"), (snapshot) => {
      const list: PartnerOrganization[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as PartnerOrganization);
      });

      list.sort((a, b) => b.timestamp - a.timestamp);
      setPartners(list);
      setLoading(false);
    }, (err) => {
      console.error("Partners list sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleRegisterPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      const id = `partner-${Date.now()}`;
      const item: PartnerOrganization = {
        id,
        name: name.trim(),
        email: email.trim(),
        scope,
        nodesCount,
        slaTier,
        status: "active",
        createdAt: new Date().toLocaleDateString(),
        timestamp: Date.now(),
      };

      await setDoc(doc(db, "partners", id), item);
      setName("");
      setEmail("");
      setNodesCount(1);
      
      await logActivity("REGISTER_PARTNER_ORG", `Registered institutional partner: ${item.name}`);
    } catch (err: any) {
      alert("Failed to register partner: " + err.message);
    }
  };

  const handleDeletePartner = async (id: string, partnerName: string) => {
    if (confirm(`Are you sure you want to completely de-register institutional partner "${partnerName}"?`)) {
      try {
        await deleteDoc(doc(db, "partners", id));
        alert("Partner removed successfully.");
        await logActivity("DELETE_PARTNER_ORG", `De-registered institutional partner: ${partnerName}`);
      } catch (err: any) {
        alert("Failed to delete partner: " + err.message);
      }
    }
  };

  const getSlaBadge = (tier: string) => {
    const styles: Record<string, string> = {
      tier_1: "bg-red-500/10 text-red-400 border-red-500/20",
      tier_2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      tier_3: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };
    return styles[tier] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 font-body">
      {/* Header */}
      <header className="border-b border-white/10 pb-6">
        <h1 className="font-heading font-bold text-3xl">Institutional Partners Directory</h1>
        <p className="text-sm text-gray-500 mt-1">Manage institutional service agreements, onboard partner laboratories, and review node distribution caps.</p>
      </header>

      {/* Onboard Partner Form */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Briefcase className="w-5 h-5 text-[#7DD3FC]" />
          <h2 className="font-heading font-bold text-lg">Onboard Partner Laboratory</h2>
        </div>

        <form onSubmit={handleRegisterPartner} className="grid md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Organization Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stanford Medical Network"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Contact Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nodes@stanford.edu"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Compute Scope Class</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] cursor-pointer"
            >
              <option value="Healthcare / Clinical Diagnostics">Healthcare / Clinical</option>
              <option value="Banking Anomaly Detections">Banking Anomaly</option>
              <option value="Agricultural Soil Diagnostics">Agricultural Soil</option>
              <option value="Research simulation clusters">Academic simulation</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Allocated Nodes Cap</label>
            <input
              type="number"
              value={nodesCount}
              onChange={(e) => setNodesCount(Number(e.target.value))}
              min={1}
              max={50}
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Agreement Tier (SLA)</label>
            <select
              value={slaTier}
              onChange={(e) => setSlaTier(e.target.value as any)}
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] cursor-pointer"
            >
              <option value="tier_1">Tier 1 (High priority - 24/7)</option>
              <option value="tier_2">Tier 2 (Standard)</option>
              <option value="tier_3">Tier 3 (Subsidized non-profit)</option>
            </select>
          </div>

          <button className="md:col-span-2 rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer h-[42px] flex items-center justify-center gap-2 mt-2">
            <Plus className="w-4 h-4" /> ONBOARD PARTNER
          </button>
        </form>
      </div>

      {/* Partners Table Directory */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
          <Briefcase className="w-5 h-5 text-purple-400" />
          <h2 className="font-heading font-bold text-lg">Partner Organizations</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing partners registry...</div>
        ) : partners.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-gray-600" />
            <p className="text-sm text-gray-500">No institutional partners onboarded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Compute Scope</th>
                  <th className="py-3 px-4">Nodes Cap</th>
                  <th className="py-3 px-4">Agreement Tier</th>
                  <th className="py-3 px-4">Onboarded Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      {p.name}
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500" /> {p.email}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-xs">
                      {p.scope}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-gray-400">
                      {p.nodesCount} active nodes
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block border text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getSlaBadge(p.slaTier)}`}>
                        {p.slaTier.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 font-mono text-xs">
                      {p.createdAt}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDeletePartner(p.id, p.name)}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove partner organization"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
