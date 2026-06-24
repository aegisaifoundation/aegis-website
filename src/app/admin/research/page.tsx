"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, Edit2, Check, ShieldAlert, FileText, Send, CheckCircle } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, getDoc } from "firebase/firestore";
import { getOrCreateUserProfile, UserProfile, hasRoleAccess } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";

interface ResearchPaper {
  id: string;
  title: string;
  slug: string;
  category: string;
  abstract: string;
  authors: string;
  date: string;
  pdfUrl: string;
  tags: string;
  timestamp: number;
}

interface ResearchProposal {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  pdfUrl: string;
  tags: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedBy: string;
  timestamp: number;
}

export default function AdminResearchCRUD() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [proposals, setProposals] = useState<ResearchProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);

  // Form states (Publications)
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Consensus Protocol");
  const [abstract, setAbstract] = useState("");
  const [authors, setAuthors] = useState("");
  const [date, setDate] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [tags, setTags] = useState("");
  
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Researcher proposal form states
  const [propTitle, setPropTitle] = useState("");
  const [propAuthors, setPropAuthors] = useState("");
  const [propAbstract, setPropAbstract] = useState("");
  const [propPdf, setPropPdf] = useState("");
  const [propTags, setPropTags] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Sync User Profile
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
    });
    return unsubscribe;
  }, []);

  // Sync Research Collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "research"), (snapshot) => {
      const list: ResearchPaper[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ResearchPaper);
      });

      if (list.length === 0 && snapshot.empty) {
        seedDefaultResearch();
      } else {
        list.sort((a, b) => b.timestamp - a.timestamp);
        setPapers(list);
        setLoading(false);
      }
    }, (err) => {
      console.error("Research sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sync Research Proposals
  useEffect(() => {
    const q = query(collection(db, "research_proposals"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ResearchProposal[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ResearchProposal);
      });
      setProposals(list);
    }, (err) => {
      console.error("Proposals sync failed:", err);
    });

    return unsubscribe;
  }, []);

  const seedDefaultResearch = async () => {
    const defaults: Omit<ResearchPaper, "id">[] = [
      {
        title: "AEGIS Network Coordination Vision Whitepaper",
        slug: "aegis-vision-whitepaper",
        category: "Consensus Protocol",
        abstract: "This paper introduces the scientific framework and Zero-Knowledge consensus rules that power the AEGIS decentralized intelligence network. We analyze federated nodes communication pathways, weight adaptation layers, and security enclaves.",
        authors: "Dr. Elena Rostova, Prof. Marcus Chen",
        date: "Jan 2026",
        pdfUrl: "/assets/documents/AEGIS_Vision_Whitepaper.pdf",
        tags: "Consensus, Zero-Knowledge, Federated AI",
        timestamp: Date.now() - 5000,
      },
      {
        title: "Federated Parameter Aggregation via Secure Homomorphic Gradients",
        slug: "federated-parameter-aggregation",
        category: "Core Engine",
        abstract: "We outline an efficient mathematical protocol for combining local Low-Rank Adaptations (LoRA) without exposing raw training samples. The scheme leverages Byzantine Fault Tolerant routing to ensure weight updates converge smoothly.",
        authors: "Akira Tanaka, Sarah Jenkins",
        date: "Mar 2026",
        pdfUrl: "/assets/documents/Federated_LoRA_Aggregation.pdf",
        tags: "LoRA, Homomorphic, Cryptography",
        timestamp: Date.now() - 4000,
      }
    ];

    try {
      for (const paper of defaults) {
        const id = `paper-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        await setDoc(doc(db, "research", id), paper);
      }
    } catch (err) {
      console.error("Failed to seed default research:", err);
    }
  };

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPaper) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!title || !slug || !abstract) {
      setFormError("Title, Slug, and Abstract are required.");
      return;
    }

    try {
      const id = editingPaper ? editingPaper.id : `paper-${Date.now()}`;
      const item: ResearchPaper = {
        id,
        title,
        slug: slug.trim().toLowerCase(),
        category,
        abstract,
        authors: authors.trim() || "AEGIS Research Lab",
        date: date.trim() || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        pdfUrl: pdfUrl.trim() || "/assets/documents/Node_System_Specifications.pdf",
        tags: tags.trim() || "Research",
        timestamp: editingPaper ? editingPaper.timestamp : Date.now(),
      };

      await setDoc(doc(db, "research", id), item);
      setFormSuccess(editingPaper ? `Successfully updated "${title}".` : `Successfully created "${title}".`);
      
      // Reset form
      setEditingPaper(null);
      setTitle("");
      setSlug("");
      setAbstract("");
      setAuthors("");
      setDate("");
      setPdfUrl("");
      setTags("");

      await logActivity(
        editingPaper ? "UPDATE_RESEARCH" : "CREATE_RESEARCH",
        `${editingPaper ? "Updated" : "Created"} research paper index: ${title}`
      );
    } catch (err: any) {
      setFormError(err.message || "Failed to save publication.");
    }
  };

  // Submit a proposal
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingProposal(true);

    try {
      const id = `proposal-${Date.now()}`;
      const proposalData: ResearchProposal = {
        id,
        title: propTitle.trim(),
        authors: propAuthors.trim() || profile.email,
        abstract: propAbstract.trim(),
        pdfUrl: propPdf.trim() || "/assets/documents/Node_System_Specifications.pdf",
        tags: propTags.trim() || "Research, AI",
        status: "Pending",
        submittedBy: profile.email,
        timestamp: Date.now()
      };

      await setDoc(doc(db, "research_proposals", id), proposalData);
      await logActivity("SUBMIT_RESEARCH_PROPOSAL", `Researcher proposal submitted: "${propTitle}"`);
      await addNotification("RESEARCH", `New research proposal submitted by ${profile.email}: "${propTitle}"`);

      setPropTitle("");
      setPropAuthors("");
      setPropAbstract("");
      setPropPdf("");
      setPropTags("");
      alert("Research proposal submitted for review successfully.");
    } catch (err: any) {
      alert("Failed to submit proposal: " + err.message);
    } finally {
      setSubmittingProposal(false);
    }
  };

  // Approve a proposal
  const handleApproveProposal = async (prop: ResearchProposal) => {
    if (!profile) return;
    try {
      // 1. Add to public research collection
      const slugId = generateSlug(prop.title);
      const paperId = `paper-${Date.now()}`;
      
      const newPaper: ResearchPaper = {
        id: paperId,
        title: prop.title,
        slug: slugId,
        category: "Core Engine",
        abstract: prop.abstract,
        authors: prop.authors,
        date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        pdfUrl: prop.pdfUrl,
        tags: prop.tags,
        timestamp: Date.now()
      };

      await setDoc(doc(db, "research", paperId), newPaper);

      // 2. Add to UI Provisioning Requests queue for developers
      const uiRequestId = `ui-${Date.now()}`;
      await setDoc(doc(db, "ui_requests", uiRequestId), {
        id: uiRequestId,
        proposalId: prop.id,
        title: prop.title,
        abstract: prop.abstract,
        authors: prop.authors,
        requestedBy: profile.email,
        status: "Pending",
        timestamp: Date.now()
      });

      // 3. Mark proposal as approved
      await setDoc(doc(db, "research_proposals", prop.id), { status: "Approved" }, { merge: true });

      await logActivity("APPROVE_RESEARCH_PROPOSAL", `Research Manager approved proposal: "${prop.title}"`);
      await addNotification("RESEARCH", `Research Manager approved "${prop.title}" and queued UI request.`);

      alert(`Proposal approved! Published to public /research index and queued UI request for developers.`);
    } catch (err: any) {
      alert("Failed to approve proposal: " + err.message);
    }
  };

  const handleRejectProposal = async (id: string, title: string) => {
    if (confirm(`Reject research proposal: "${title}"?`)) {
      try {
        await setDoc(doc(db, "research_proposals", id), { status: "Rejected" }, { merge: true });
        await logActivity("REJECT_RESEARCH_PROPOSAL", `Rejected research proposal "${title}"`);
      } catch (err: any) {
        alert("Failed to reject proposal: " + err.message);
      }
    }
  };

  const handleEditClick = (paper: ResearchPaper) => {
    setEditingPaper(paper);
    setTitle(paper.title);
    setSlug(paper.slug);
    setCategory(paper.category);
    setAbstract(paper.abstract);
    setAuthors(paper.authors);
    setDate(paper.date);
    setPdfUrl(paper.pdfUrl);
    setTags(paper.tags);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, paperTitle: string) => {
    if (confirm(`Are you sure you want to permanently delete "${paperTitle}"?`)) {
      try {
        await deleteDoc(doc(db, "research", id));
        alert("Publication removed.");
        if (editingPaper?.id === id) {
          setEditingPaper(null);
        }
        await logActivity("DELETE_RESEARCH", `Deleted research paper: ${paperTitle}`);
      } catch (err: any) {
        alert("Failed to delete publication: " + err.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPaper(null);
    setTitle("");
    setSlug("");
    setAbstract("");
    setAuthors("");
    setDate("");
    setPdfUrl("");
    setTags("");
  };

  const canApprove = profile && (
    profile.role === "super_admin" || 
    profile.role === "admin" || 
    profile.role === "research_manager" || 
    profile.role === "research_director"
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl">Research Publications Registry</h1>
          <p className="text-sm text-gray-500 mt-1">Manage publications distributed to the public library, and coordinate researchers workflows.</p>
        </div>
      </header>

      {/* Grid Layout for Form & Workflows */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Submit Proposal form (available to researchers) */}
          {profile && (profile.role === "researcher" || hasRoleAccess(profile.role, "editor")) && (
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Send className="w-5 h-5 text-purple-400" />
                <h2 className="font-heading font-bold text-lg">Submit Research Proposal</h2>
              </div>
              <p className="text-xs text-gray-400">
                Submit raw scientific papers for managers review. Upon approval, pages are queued dynamically.
              </p>

              <form onSubmit={handleSubmitProposal} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Proposal Title</label>
                  <input
                    value={propTitle}
                    onChange={(e) => setPropTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus under High Latency bounds"
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Authors</label>
                    <input
                      value={propAuthors}
                      onChange={(e) => setPropAuthors(e.target.value)}
                      placeholder="e.g. Dr. Alexis Thorne"
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">PDF Document Link</label>
                    <input
                      value={propPdf}
                      onChange={(e) => setPropPdf(e.target.value)}
                      placeholder="/assets/documents/Thorne2026.pdf"
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Search Tags</label>
                  <input
                    value={propTags}
                    onChange={(e) => setPropTags(e.target.value)}
                    placeholder="Latency, Consensus, Byzantine Fault"
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Abstract Summary</label>
                  <textarea
                    value={propAbstract}
                    onChange={(e) => setPropAbstract(e.target.value)}
                    rows={4}
                    placeholder="Provide full paper abstract summary..."
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-purple-500 leading-relaxed resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingProposal}
                  className="rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] mt-2 cursor-pointer text-white"
                >
                  {submittingProposal ? "SUBMITTING PROPOSAL..." : "SUBMIT SCIENTIFIC PROPOSAL"}
                </button>
              </form>
            </div>
          )}

          {/* Standard CRUD Form (visible to editors/admins only) */}
          {profile && hasRoleAccess(profile.role, "editor") && (
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4 mt-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <BookOpen className="w-5 h-5 text-[#7DD3FC]" />
                <h2 className="font-heading font-bold text-lg">
                  {editingPaper ? `Edit Paper Details: ${editingPaper.title}` : "Direct Publication bypass"}
                </h2>
              </div>
              <p className="text-xs text-gray-400">
                Directly add or modify research papers indexed in the database.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Paper Title</label>
                    <input
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Zero-Knowledge Cryptographic Consensus enclaves"
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Slug Identifier (URL Friendly)</label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. zero-knowledge-consensus-enclaves"
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Category Tag</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] cursor-pointer"
                    >
                      <option value="Consensus Protocol">Consensus Protocol</option>
                      <option value="Core Engine">Core Engine</option>
                      <option value="Nodes Telemetry">Nodes Telemetry</option>
                      <option value="Economic Models">Economic Models</option>
                      <option value="Privacy Studies">Privacy Studies</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Authors</label>
                    <input
                      value={authors}
                      onChange={(e) => setAuthors(e.target.value)}
                      placeholder="e.g. Dr. Sarah Jenkins, Prof. Chen"
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Publish Date</label>
                    <input
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. June 2026"
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">PDF Document File URL</label>
                    <input
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                      placeholder="e.g. /assets/documents/Specification.pdf"
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Search Tags</label>
                    <input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g. ZK-Proofs, Latency, Weight adapters"
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Abstract Paragraph Summary</label>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    rows={4}
                    placeholder="Provide a detailed abstract summary..."
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  {editingPaper && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3 text-xs font-bold transition-all cursor-pointer text-white"
                    >
                      CANCEL EDIT
                    </button>
                  )}
                  <button className="rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] px-8 py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer text-white">
                    {editingPaper ? "SAVE CHANGES" : "PUBLISH DIRECTLY"}
                  </button>
                </div>
              </form>
              {formError && <p className="text-xs text-red-400 mt-1">{formError}</p>}
              {formSuccess && <p className="text-xs text-emerald-400 mt-1">{formSuccess}</p>}
            </div>
          )}
        </div>

        {/* Right Column: Pending Approvals & Public papers lists */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Research Managers Pending Proposals Queue */}
          {canApprove && (
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h2 className="font-heading font-bold text-base text-white">Pending proposals Queue</h2>
              </div>
              <p className="text-xs text-gray-400">
                Submitted by researchers. Review and approve to publish automatically and dispatch custom layouts builders.
              </p>

              <div className="flex flex-col gap-3 mt-2 max-h-[350px] overflow-y-auto pr-1">
                {proposals.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500 font-mono">
                    No proposals pending review.
                  </div>
                ) : (
                  proposals.map((prop) => (
                    <div 
                      key={prop.id} 
                      className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                        prop.status === "Approved"
                          ? "bg-white/[0.01] border-white/5 opacity-60"
                          : "bg-emerald-500/5 border-emerald-500/10"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <strong className="text-white text-xs block font-heading truncate max-w-[180px]">{prop.title}</strong>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                          prop.status === "Approved" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}>
                          {prop.status}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-gray-400 leading-relaxed font-light line-clamp-3">
                        {prop.abstract}
                      </div>

                      {prop.status === "Pending" && (
                        <div className="flex justify-end gap-2 mt-1">
                          <button
                            onClick={() => handleRejectProposal(prop.id, prop.title)}
                            className="rounded border border-white/10 px-3 py-1 text-[9px] font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            REJECT
                          </button>
                          <button
                            onClick={() => handleApproveProposal(prop)}
                            className="rounded bg-emerald-500 text-black font-bold px-3 py-1 text-[9px] hover:bg-emerald-600 transition-colors cursor-pointer"
                          >
                            APPROVE & PUBLISH
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Publications List Table (Full Width) */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30 mt-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <h2 className="font-heading font-bold text-lg">Published Research Index</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing research papers...</div>
        ) : papers.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-gray-600" />
            <p className="text-sm text-gray-500">No publications added yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                  <th className="py-3 px-4">Paper Title</th>
                  <th className="py-3 px-4">Authors</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  {profile && hasRoleAccess(profile.role, "editor") && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {papers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      <span>{paper.title}</span>
                      <span className="block text-[10px] text-gray-500 font-mono mt-0.5">/research/{paper.slug}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-xs">
                      {paper.authors}
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] uppercase font-bold text-[#7DD3FC]">
                        {paper.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 font-mono text-xs">
                      {paper.date}
                    </td>
                    {profile && hasRoleAccess(profile.role, "editor") && (
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(paper)}
                            className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                            title="Edit details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(paper.id, paper.title)}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete paper"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
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
