"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, Edit2, Check, ShieldAlert } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { logActivity } from "@/config/activityLogger";

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

export default function AdminResearchCRUD() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);

  // Form states
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
    
    // Scroll to form
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

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-6">
        <h1 className="font-heading font-bold text-3xl">Research Publications Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Add, edit, and delete publications distributed to the public research library page.</p>
      </header>

      {/* CRUD Form */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <BookOpen className="w-5 h-5 text-[#7DD3FC]" />
          <h2 className="font-heading font-bold text-lg">
            {editingPaper ? `Edit Paper Details: ${editingPaper.title}` : "Publish New Research Paper"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Authors (Comma separated)</label>
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
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Search Tags (Comma separated)</label>
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
              placeholder="Provide a detailed abstract summary of the scientific paper..."
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            {editingPaper && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3 text-xs font-bold transition-all cursor-pointer"
              >
                CANCEL EDIT
              </button>
            )}
            <button className="rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] px-8 py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer">
              {editingPaper ? "SAVE CHANGES" : "PUBLISH PAPER"}
            </button>
          </div>
        </form>
        {formError && <p className="text-xs text-red-400 mt-1">{formError}</p>}
        {formSuccess && <p className="text-xs text-emerald-400 mt-1">{formSuccess}</p>}
      </div>

      {/* Publications List Table */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <h2 className="font-heading font-bold text-lg">System Research Papers</h2>
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
                  <th className="py-3 px-4 text-right">Actions</th>
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
