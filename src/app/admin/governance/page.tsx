"use client";

import { useState, useEffect } from "react";
import { Scale, Vote, PlusCircle, CheckCircle2, XCircle, ShieldAlert, Award, RefreshCw } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { logActivity } from "@/config/activityLogger";

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  category: "parameter_change" | "node_authorization" | "treasury_allocation";
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  quorumNeeded: number;
  status: "active" | "passed" | "defeated" | "processing";
  createdBy: string;
  createdAt: string;
  timestamp: number;
}

export default function AdminDaoGovernance() {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<"parameter_change" | "node_authorization" | "treasury_allocation">("parameter_change");

  // Sync Proposals from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "governance_proposals"), (snapshot) => {
      const list: GovernanceProposal[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as GovernanceProposal);
      });

      list.sort((a, b) => b.timestamp - a.timestamp);
      setProposals(list);
      setLoading(false);
    }, (err) => {
      console.error("Governance proposals sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    try {
      const id = `prop-${Date.now()}`;
      const item: GovernanceProposal = {
        id,
        title: title.trim(),
        description: desc.trim(),
        category,
        yesVotes: 1,
        noVotes: 0,
        abstainVotes: 0,
        quorumNeeded: 10000,
        status: "active",
        createdBy: "governance_delegate@aegis.com",
        createdAt: new Date().toLocaleDateString(),
        timestamp: Date.now(),
      };

      await setDoc(doc(db, "governance_proposals", id), item);
      setTitle("");
      setDesc("");
      
      await logActivity("CREATE_GOVERNANCE_PROPOSAL", `Created proposal: ${item.title}`);
    } catch (err: any) {
      alert("Failed to submit proposal: " + err.message);
    }
  };

  const handleCastVote = async (id: string, propTitle: string, type: "yes" | "no" | "abstain") => {
    try {
      const propRef = doc(db, "governance_proposals", id);
      const updates: Record<string, any> = {};
      
      if (type === "yes") updates.yesVotes = (proposals.find(p=>p.id===id)?.yesVotes || 0) + 1;
      else if (type === "no") updates.noVotes = (proposals.find(p=>p.id===id)?.noVotes || 0) + 1;
      else updates.abstainVotes = (proposals.find(p=>p.id===id)?.abstainVotes || 0) + 1;

      await updateDoc(propRef, updates);
      alert(`Vote cast successfully: ${type.toUpperCase()}`);
      await logActivity("CAST_GOVERNANCE_VOTE", `Voted ${type.toUpperCase()} on proposal: ${propTitle}`);
    } catch (err: any) {
      alert("Failed to cast vote: " + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
      passed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      defeated: "bg-red-500/10 text-red-400 border-red-500/20",
      processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    return styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 font-body">
      {/* Header */}
      <header className="border-b border-white/10 pb-6">
        <h1 className="font-heading font-bold text-3xl">DAO Governance Proposals</h1>
        <p className="text-sm text-gray-500 mt-1">Submit governance draft acts, review multi-signature approvals, and adjust core consensus protocols.</p>
      </header>

      {/* Grid: Create Proposal vs Quorum Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Proposal Form */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <PlusCircle className="w-5 h-5 text-[#7DD3FC]" />
            <h2 className="font-heading font-bold text-lg">Create New Voting Proposal</h2>
          </div>

          <form onSubmit={handleCreateProposal} className="flex flex-col gap-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Proposal Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AGP-03: Modify Minimum GPU Node RAM Requirements"
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] cursor-pointer"
                >
                  <option value="parameter_change">Parameter Change</option>
                  <option value="node_authorization">Node Authorization</option>
                  <option value="treasury_allocation">Treasury Allocation</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Proposal Abstract Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                placeholder="Detail proposal parameters, code targets, and execution impact..."
                className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed"
                required
              />
            </div>

            <button className="self-end rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] px-6 py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer mt-2 flex items-center gap-2">
              <Vote className="w-4 h-4" /> SUBMIT DRAFT FOR VOTE
            </button>
          </form>
        </div>

        {/* Quorum Stats */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Award className="w-5 h-5 text-purple-400" />
            <h2 className="font-heading font-bold text-lg">Consensus Quorum Stats</h2>
          </div>

          <div className="flex flex-col gap-4 text-xs font-light">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-gray-500">Voting Power Quorum Threshold</span>
              <span className="text-white font-mono font-semibold">10,000 AGS</span>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-gray-500">Active Delegate Participation</span>
              <span className="text-[#7DD3FC] font-mono font-bold">88.42%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Consensus Integrity Rating</span>
              <span className="text-emerald-400 font-bold">Passed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals list */}
      <div className="flex flex-col gap-6 mt-2">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#7DD3FC]" />
            <h2 className="font-heading font-bold text-lg">Act Proposals List</h2>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing governance proposals...</div>
        ) : proposals.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-gray-600" />
            <p className="text-sm text-gray-500">No active governance proposals drafts listed.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {proposals.map((prop) => {
              const totalVotes = prop.yesVotes + prop.noVotes + prop.abstainVotes;
              const yesPercent = totalVotes > 0 ? Math.round((prop.yesVotes / totalVotes) * 100) : 0;
              const noPercent = totalVotes > 0 ? Math.round((prop.noVotes / totalVotes) * 100) : 0;

              return (
                <div 
                  key={prop.id}
                  className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30 flex flex-col gap-4 text-left"
                >
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block border text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusBadge(prop.status)}`}>
                          {prop.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">Scope: {prop.category.replace("_", " ")}</span>
                      </div>
                      <h3 className="font-bold text-white text-base mt-1">{prop.title}</h3>
                      <p className="text-[10px] text-gray-500">Proposed by: <span className="text-[#7DD3FC]">{prop.createdBy}</span> on {prop.createdAt}</p>
                    </div>

                    {prop.status === "active" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCastVote(prop.id, prop.title, "yes")}
                          className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[10px] px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          VOTE YES
                        </button>
                        <button
                          onClick={() => handleCastVote(prop.id, prop.title, "no")}
                          className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          VOTE NO
                        </button>
                        <button
                          onClick={() => handleCastVote(prop.id, prop.title, "abstain")}
                          className="border border-white/15 hover:bg-white/5 text-gray-400 hover:text-white text-[10px] px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          ABSTAIN
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed font-light">{prop.description}</p>

                  {/* Vote Progress Graph representation */}
                  <div className="flex flex-col gap-1.5 mt-2 border-t border-white/5 pt-3">
                    <div className="flex justify-between items-center text-[10.5px] text-gray-500 font-mono">
                      <span>Total Votes Cast: {totalVotes.toLocaleString()}</span>
                      <span>Quorum Progress: {Math.round((totalVotes / prop.quorumNeeded) * 100)}%</span>
                    </div>

                    <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div style={{ width: `${yesPercent}%` }} className="bg-emerald-500 h-full" />
                      <div style={{ width: `${noPercent}%` }} className="bg-red-500 h-full" />
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                      <span className="text-emerald-400">Yes: {yesPercent}% ({prop.yesVotes})</span>
                      <span className="text-red-400">No: {noPercent}% ({prop.noVotes})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
