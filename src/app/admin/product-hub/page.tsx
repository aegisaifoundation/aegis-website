"use client";

import { useEffect, useState } from "react";
import { Edit, Eye, Plus, Trash2, ArrowRight, Grid, FileText, CheckCircle, HelpCircle, Layers, PlusCircle } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, updateDoc } from "firebase/firestore";
import { getOrCreateUserProfile, UserProfile } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";
import Link from "next/link";

interface PageConfig {
  id: string; // The slug
  title: string;
  description: string;
  template: "publication" | "grid" | "canvas";
  authors?: string;
  category?: string;
  date?: string;
  abstract?: string;
  bodyParagraphs?: string[];
  cards?: { title: string; description: string; badge?: string; link?: string }[];
  formEnabled?: boolean;
  formTitle?: string;
}

interface UIRequest {
  id: string;
  proposalId: string;
  title: string;
  abstract: string;
  authors: string;
  requestedBy: string;
  status: "Pending" | "Created";
  timestamp: number;
}

export default function ProductUXHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic pages list
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [uiRequests, setUiRequests] = useState<UIRequest[]>([]);

  // Form states
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<"publication" | "grid" | "canvas">("publication");
  
  // Publication fields
  const [authors, setAuthors] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [abstract, setAbstract] = useState("");
  const [bodyText, setBodyText] = useState(""); // Multi-line string split by \n\n

  // Grid fields
  const [cards, setCards] = useState<{ title: string; description: string; badge?: string; link?: string }[]>([]);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDesc, setNewCardDesc] = useState("");
  const [newCardBadge, setNewCardBadge] = useState("");
  const [newCardLink, setNewCardLink] = useState("");

  // Canvas fields
  const [formEnabled, setFormEnabled] = useState(false);
  const [formTitle, setFormTitle] = useState("Initiate Query Portal");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeUiReq, setActiveUiReq] = useState<string | null>(null);

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

  // Sync website_pages
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "website_pages"), (snapshot) => {
      const list: PageConfig[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as PageConfig);
      });
      setPages(list);
    }, (err) => console.error("Pages sync failed:", err));

    return unsubscribe;
  }, []);

  // Sync ui_requests
  useEffect(() => {
    const q = query(collection(db, "ui_requests"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UIRequest[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as UIRequest);
      });
      setUiRequests(list);
    }, (err) => console.error("UI Requests sync failed:", err));

    return unsubscribe;
  }, []);

  const handleAddCard = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    setCards([...cards, {
      title: newCardTitle.trim(),
      description: newCardDesc.trim(),
      badge: newCardBadge.trim() || undefined,
      link: newCardLink.trim() || undefined
    }]);
    setNewCardTitle("");
    setNewCardDesc("");
    setNewCardBadge("");
    setNewCardLink("");
  };

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleUseUIRequest = (req: UIRequest) => {
    // Generate clean slug from title
    const generatedSlug = req.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 30);

    setSlug(generatedSlug);
    setTitle(req.title);
    setTemplate("publication");
    setDescription(`Research publication layout for ${req.title}`);
    setAuthors(req.authors);
    setCategory("Research");
    setDate(new Date(req.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
    setAbstract(req.abstract);
    setBodyText("Insert research paper content details here...");
    setActiveUiReq(req.id);
    setEditingId(null);
  };

  const handleEditPage = (page: PageConfig) => {
    setEditingId(page.id);
    setSlug(page.id);
    setTitle(page.title);
    setDescription(page.description);
    setTemplate(page.template);
    
    // Reset specific fields
    setAuthors(page.authors || "");
    setCategory(page.category || "");
    setDate(page.date || "");
    setAbstract(page.abstract || "");
    setBodyText(page.bodyParagraphs ? page.bodyParagraphs.join("\n\n") : "");
    setCards(page.cards || []);
    setFormEnabled(page.formEnabled || false);
    setFormTitle(page.formTitle || "Initiate Query Portal");
    setActiveUiReq(null);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleanSlug) {
      alert("Invalid slug identifier.");
      return;
    }

    setSubmitting(true);
    try {
      const pageData: Partial<PageConfig> = {
        title: title.trim(),
        description: description.trim(),
        template: template
      };

      if (template === "publication") {
        pageData.authors = authors.trim();
        pageData.category = category.trim();
        pageData.date = date.trim() || new Date().toLocaleDateString();
        pageData.abstract = abstract.trim();
        pageData.bodyParagraphs = bodyText.split("\n\n").map(p => p.trim()).filter(Boolean);
      } else if (template === "grid") {
        pageData.category = category.trim() || "Catalog";
        pageData.cards = cards;
      } else if (template === "canvas") {
        pageData.bodyParagraphs = bodyText.split("\n\n").map(p => p.trim()).filter(Boolean);
        pageData.formEnabled = formEnabled;
        pageData.formTitle = formTitle.trim();
      }

      await setDoc(doc(db, "website_pages", cleanSlug), pageData);
      
      // Update UI Request state if loaded from request
      if (activeUiReq) {
        await updateDoc(doc(db, "ui_requests", activeUiReq), { status: "Created" });
      }

      await logActivity(
        editingId ? "UPDATE_PAGE" : "CREATE_PAGE", 
        `Custom page /${cleanSlug} successfully saved.`
      );
      await addNotification("PRODUCT", `Dynamic page /${cleanSlug} updated in template registry.`);

      // Reset
      setSlug("");
      setTitle("");
      setDescription("");
      setAuthors("");
      setCategory("");
      setDate("");
      setAbstract("");
      setBodyText("");
      setCards([]);
      setFormEnabled(false);
      setEditingId(null);
      setActiveUiReq(null);

      alert("Dynamic custom page saved successfully.");
    } catch (err: any) {
      alert("Failed to save page: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (confirm(`Are you sure you want to permanently delete page /${id}?`)) {
      try {
        await deleteDoc(doc(db, "website_pages", id));
        await logActivity("DELETE_PAGE", `Deleted dynamic page /${id}`);
        alert(`Successfully deleted page /${id}`);
      } catch (err: any) {
        alert("Failed to delete page: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-gray-500 animate-pulse">
        Linking Product & UX Hub Workspace database...
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-10 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-pink-950/20 to-black overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl tracking-wide text-white uppercase">
              Product & UX Hub Workspace
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Construct dynamic website content and pages without writing code. Direct developers UI requests routing gate and templates repository.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left 4 Cols: UI Requests Queue */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
            <div>
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-pink-400" /> UI Provisioning Requests
              </h2>
              <p className="text-[10px] text-gray-400 mt-1">
                Requested by Research Managers upon paper approvals to allocate space in the website layout.
              </p>
            </div>

            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {uiRequests.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">
                  No pending UI request dispatches.
                </div>
              ) : (
                uiRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                      req.status === "Created"
                        ? "bg-white/[0.01] border-white/5 opacity-60"
                        : "bg-pink-500/5 border-pink-500/10 hover:border-pink-500/20"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-white text-xs truncate max-w-[150px]">{req.title}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                        req.status === "Created" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-400 leading-relaxed truncate">{req.abstract}</p>

                    {req.status !== "Created" && (
                      <button
                        onClick={() => handleUseUIRequest(req)}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-white font-bold py-1.5 text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Create Page <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Dynamic Page Builder Form */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <form onSubmit={handleSavePage} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-pink-400" /> 
                {editingId ? `Modify Custom Page: /${editingId}` : "Dynamic Page Creator"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setSlug("");
                    setTitle("");
                    setDescription("");
                    setAuthors("");
                    setCategory("");
                    setDate("");
                    setAbstract("");
                    setBodyText("");
                    setCards([]);
                  }}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Page Route (Slug)</label>
                <input
                  type="text"
                  value={slug}
                  disabled={!!editingId}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. quantum-paper-1"
                  className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-pink-500 text-xs text-white disabled:opacity-50"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Page Core Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quantum Supremacy Ledger"
                  className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-pink-500 text-xs text-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Layout Template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as any)}
                  className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-pink-500 text-xs text-gray-300"
                >
                  <option value="publication">Research Publication</option>
                  <option value="grid">Feature Showcase Grid</option>
                  <option value="canvas">Canvas Contact Landing</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Page Summary / Meta Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify descriptive summary for SEO meta tags details..."
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-pink-500 text-xs text-white"
                required
              />
            </div>

            {/* Template Specific Fields */}
            {template === "publication" && (
              <div className="flex flex-col gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Publication Template Parameters</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Authors</label>
                    <input
                      type="text"
                      value={authors}
                      onChange={(e) => setAuthors(e.target.value)}
                      placeholder="e.g. Dr. Alex Thorne"
                      className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-pink-500 text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Category Tag</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Neural Networks"
                      className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-pink-500 text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Date Text</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. June 2026"
                      className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-pink-500 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Abstract Narrative</label>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="Provide concise abstract narrative log..."
                    rows={3}
                    className="rounded-lg bg-white/5 border border-white/10 p-3 outline-none focus:border-pink-500 text-xs text-white resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Body Content (Use double line breaks for paragraph breaks)</label>
                  <textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder="Enter main text content parameters..."
                    rows={5}
                    className="rounded-lg bg-white/5 border border-white/10 p-3 outline-none focus:border-pink-500 text-xs text-white resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {template === "grid" && (
              <div className="flex flex-col gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Showcase Grid Catalog Cards</span>

                <div className="flex flex-col gap-1.5 mb-2">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Grid Category Header</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Core Protocols API"
                    className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-pink-500 text-xs text-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {cards.map((c, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex items-center gap-4 text-xs">
                      <div>
                        <div className="font-semibold text-white">{c.title}</div>
                        {c.badge && <span className="text-[8px] text-gray-500 font-mono uppercase">{c.badge}</span>}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCard(idx)} 
                        className="text-gray-500 hover:text-red-400 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                  <span className="text-[9px] text-gray-400 font-semibold uppercase">Add Card Specification</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Card Title"
                      className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                    />
                    <input
                      type="text"
                      value={newCardBadge}
                      onChange={(e) => setNewCardBadge(e.target.value)}
                      placeholder="Badge (optional)"
                      className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={newCardDesc}
                    onChange={(e) => setNewCardDesc(e.target.value)}
                    placeholder="Card Description narrative details"
                    className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                  <input
                    type="text"
                    value={newCardLink}
                    onChange={(e) => setNewCardLink(e.target.value)}
                    placeholder="External Link Path (e.g. /nodes)"
                    className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCard}
                    className="rounded bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-white font-bold py-1.5 text-xs uppercase tracking-wider self-start px-4 cursor-pointer"
                  >
                    Add Card to Grid
                  </button>
                </div>
              </div>
            )}

            {template === "canvas" && (
              <div className="flex flex-col gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Canvas Template Parameters</span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Body Narratives (Use double line breaks for paragraph breaks)</label>
                  <textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder="Enter main layout narrative text content details..."
                    rows={6}
                    className="rounded-lg bg-white/5 border border-white/10 p-3 outline-none focus:border-pink-500 text-xs text-white resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                  <input
                    type="checkbox"
                    id="formEnabled"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-black outline-none accent-pink-500"
                  />
                  <label htmlFor="formEnabled" className="text-xs font-semibold text-gray-300 cursor-pointer">
                    Enable Interactive Query Forms Integration
                  </label>
                </div>

                {formEnabled && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Contact Form Title Header</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Initiate Query Portal"
                      className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-pink-500 text-xs text-white"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-pink-500 hover:bg-pink-600 disabled:bg-gray-700 py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)] mt-2 cursor-pointer text-white"
            >
              {submitting ? "SAVING PAGE CAPSULE..." : (editingId ? "SAVE PAGE MODIFICATIONS" : "GENERATE CUSTOM PAGE")}
            </button>
          </form>

          {/* Active Dynamic Pages Directory */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-pink-400" /> Registered Custom Pages Directory
            </h2>

            <div className="flex flex-col gap-3">
              {pages.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">
                  No custom template pages registered.
                </div>
              ) : (
                pages.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-xs">/{p.id}</strong>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-gray-400 bg-white/5 uppercase">
                          {p.template}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">{p.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${p.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      
                      <button
                        onClick={() => handleEditPage(p)}
                        className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-pink-500/10 text-gray-400 hover:text-pink-400 hover:border-pink-500/10 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeletePage(p.id)}
                        className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 hover:border-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
