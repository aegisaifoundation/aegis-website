"use client";

import { useEffect, useState } from "react";
import { Edit, Eye, Plus, Trash2, ArrowRight, Grid, FileText, CheckCircle, HelpCircle, Layers, PlusCircle, ToggleLeft, ToggleRight, Settings } from "lucide-react";
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

interface FeatureFlags {
  newHeroDesign: boolean;
  cinematicManifesto: boolean;
  abTestEconomicsRate: boolean;
  updatedBy: string;
  lastUpdated: string;
}

export default function ProductUXHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"creator" | "ui_requests" | "ab_testing">("creator");

  // Dynamic pages list
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [uiRequests, setUiRequests] = useState<UIRequest[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    newHeroDesign: false,
    cinematicManifesto: true,
    abTestEconomicsRate: false,
    updatedBy: "System Default",
    lastUpdated: new Date().toISOString()
  });

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
  const [bodyText, setBodyText] = useState("");

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

  // Sync Feature Flags
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "site_settings", "homepage_feature_flags"), (snap) => {
      if (snap.exists()) {
        setFeatureFlags(snap.data() as FeatureFlags);
      } else {
        setDoc(doc(db, "site_settings", "homepage_feature_flags"), {
          newHeroDesign: false,
          cinematicManifesto: true,
          abTestEconomicsRate: false,
          updatedBy: "System",
          lastUpdated: new Date().toISOString()
        });
      }
    }, (err) => console.error("Feature flags sync failed:", err));

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
    setActiveSubTab("creator");
  };

  const handleEditPage = (page: PageConfig) => {
    setEditingId(page.id);
    setSlug(page.id);
    setTitle(page.title);
    setDescription(page.description);
    setTemplate(page.template);
    setAuthors(page.authors || "");
    setCategory(page.category || "");
    setDate(page.date || "");
    setAbstract(page.abstract || "");
    setBodyText(page.bodyParagraphs ? page.bodyParagraphs.join("\n\n") : "");
    setCards(page.cards || []);
    setFormEnabled(page.formEnabled || false);
    setFormTitle(page.formTitle || "Initiate Query Portal");
    setActiveUiReq(null);
    setActiveSubTab("creator");
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
      
      if (activeUiReq) {
        await updateDoc(doc(db, "ui_requests", activeUiReq), { status: "Created" });
      }

      await logActivity(editingId ? "UPDATE_PAGE" : "CREATE_PAGE", `Custom page /${cleanSlug} saved.`);
      await addNotification("PRODUCT", `Dynamic page /${cleanSlug} registered.`);

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

      alert("Page saved successfully.");
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (confirm(`Permanently delete page /${id}?`)) {
      try {
        await deleteDoc(doc(db, "website_pages", id));
        await logActivity("DELETE_PAGE", `Deleted page /${id}`);
      } catch (err: any) {
        alert("Failed: " + err.message);
      }
    }
  };

  const handleToggleFlag = async (key: keyof Omit<FeatureFlags, "updatedBy" | "lastUpdated">) => {
    if (!profile) return;
    try {
      const updated = {
        ...featureFlags,
        [key]: !featureFlags[key],
        updatedBy: profile.email,
        lastUpdated: new Date().toISOString()
      };
      await setDoc(doc(db, "site_settings", "homepage_feature_flags"), updated);
      await logActivity("TOGGLE_FEATURE_FLAG", `Toggled feature flag [${key}] to ${!featureFlags[key]}`);
    } catch (err: any) {
      alert("Failed: " + err.message);
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
              Consolidated builder console. Construct dynamic pages, map UI request slots, and toggle A/B feature variables.
            </p>
          </div>
        </div>

        {/* Sub-Tab Controls */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0 font-body">
          <button
            onClick={() => setActiveSubTab("creator")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "creator" ? "bg-pink-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Edit className="w-3.5 h-3.5" /> Page Creator
          </button>
          <button
            onClick={() => setActiveSubTab("ui_requests")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "ui_requests" ? "bg-pink-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" /> UI Requests ({uiRequests.filter(r => r.status === "Pending").length})
          </button>
          <button
            onClick={() => setActiveSubTab("ab_testing")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "ab_testing" ? "bg-pink-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> A/B Testing
          </button>
        </div>
      </div>

      {/* Tab Content: Creator */}
      {activeSubTab === "creator" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <form onSubmit={handleSavePage} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-pink-400" /> 
                  {editingId ? `Modify Custom Page: /${editingId}` : "Dynamic Page Creator"}
                </h2>
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
                    className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-pink-500 text-xs text-white"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Page Core Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Quantum Supremacy"
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
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Meta Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specify descriptive summary..."
                  className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-pink-500 text-xs text-white"
                  required
                />
              </div>

              {template === "publication" && (
                <div className="flex flex-col gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="Authors" className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-pink-500" />
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category Tag" className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-pink-500" />
                    <input type="text" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Publish Date" className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-pink-500" />
                  </div>
                  <textarea value={abstract} onChange={(e) => setAbstract(e.target.value)} placeholder="Abstract" rows={2} className="rounded bg-black border border-white/10 p-3 text-xs text-white resize-none" />
                  <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} placeholder="Main Body (Double breaks for paragraph)" rows={4} className="rounded bg-black border border-white/10 p-3 text-xs text-white resize-none leading-relaxed" />
                </div>
              )}

              {template === "grid" && (
                <div className="flex flex-col gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Grid Category Header" className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white" />
                  <div className="flex flex-wrap gap-2">
                    {cards.map((c, idx) => (
                      <div key={idx} className="p-2 rounded border border-white/5 bg-white/[0.02] flex items-center gap-2 text-xs text-white">
                        <span>{c.title}</span>
                        <button type="button" onClick={() => handleRemoveCard(idx)} className="text-gray-500 hover:text-red-400">✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/5 pt-2 flex flex-col gap-3">
                    <input type="text" value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)} placeholder="Card Title" className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white" />
                    <input type="text" value={newCardDesc} onChange={(e) => setNewCardDesc(e.target.value)} placeholder="Card Description" className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white" />
                    <input type="text" value={newCardBadge} onChange={(e) => setNewCardBadge(e.target.value)} placeholder="Badge" className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white" />
                    <input type="text" value={newCardLink} onChange={(e) => setNewCardLink(e.target.value)} placeholder="Link Path" className="rounded bg-black border border-white/10 px-3 py-1.5 text-xs text-white" />
                    <button type="button" onClick={handleAddCard} className="rounded bg-pink-500/10 border border-pink-500/20 text-white font-bold py-1.5 text-xs self-start px-4 cursor-pointer">Add Card</button>
                  </div>
                </div>
              )}

              {template === "canvas" && (
                <div className="flex flex-col gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                  <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} placeholder="Body paragraphs..." rows={4} className="rounded bg-black border border-white/10 p-3 text-xs text-white resize-none leading-relaxed" />
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="formEnabled" checked={formEnabled} onChange={(e) => setFormEnabled(e.target.checked)} className="accent-pink-500" />
                    <label htmlFor="formEnabled" className="text-xs text-gray-300 cursor-pointer">Enable Contact Form</label>
                  </div>
                  {formEnabled && <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Form Title" className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white" />}
                </div>
              )}

              <button type="submit" disabled={submitting} className="rounded bg-pink-500 hover:bg-pink-600 py-3 text-xs font-bold text-white transition-all cursor-pointer">
                {submitting ? "SAVING..." : "SAVE PAGE ROUTE"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-pink-400" /> Registered Pages
            </h2>
            <div className="flex flex-col gap-3">
              {pages.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-between gap-3">
                  <div className="overflow-hidden">
                    <strong className="text-white text-xs block truncate">/{p.id}</strong>
                    <span className="text-[8px] font-mono px-1 py-0.5 rounded border border-white/10 text-gray-400 bg-white/5 uppercase">{p.template}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEditPage(p)} className="p-1 rounded bg-white/5 text-gray-400 hover:text-white border border-white/10"><Edit className="w-3 h-3" /></button>
                    <button onClick={() => handleDeletePage(p.id)} className="p-1 rounded bg-white/5 text-gray-400 hover:text-red-400 border border-white/10"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: UI Requests */}
      {activeSubTab === "ui_requests" && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 max-w-4xl mx-auto w-full">
          <div>
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-pink-400" /> Spacing Provisioning Requests
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">Requested by Research Reviewers. Select a request template to initialize builder layouts.</p>
          </div>
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
            {uiRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 font-mono">No requests pending.</div>
            ) : (
              uiRequests.map((req) => (
                <div key={req.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${req.status === "Created" ? "opacity-50 border-white/5 bg-white/[0.01]" : "border-pink-500/10 bg-pink-500/5"}`}>
                  <div>
                    <strong className="text-white text-xs block">{req.title}</strong>
                    <span className="text-[9px] text-gray-400 block font-mono mt-1">Authors: {req.authors} | By: {req.requestedBy.split("@")[0]}</span>
                  </div>
                  {req.status === "Pending" ? (
                    <button onClick={() => handleUseUIRequest(req)} className="rounded bg-pink-500 hover:bg-pink-600 text-white font-bold px-3 py-1.5 text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      Use Template
                    </button>
                  ) : (
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold">Created</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: A/B Testing */}
      {activeSubTab === "ab_testing" && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6 max-w-xl mx-auto w-full">
          <div>
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-pink-400" /> A/B Testing Homepage Feature Flags
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">Toggle experimental website layout modules live without writing code. Settings persist in Firestore.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">New Futuristic Hero Layout</span>
                <span className="text-[9px] text-gray-500">Toggles full-screen dynamic particles container.</span>
              </div>
              <button onClick={() => handleToggleFlag("newHeroDesign")} className="text-pink-400 hover:text-pink-300">
                {featureFlags.newHeroDesign ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-600" />}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Cinematic Manifesto Reveal Module</span>
                <span className="text-[9px] text-gray-500">Displays the full enclaves cinematic video player.</span>
              </div>
              <button onClick={() => handleToggleFlag("cinematicManifesto")} className="text-pink-400 hover:text-pink-300">
                {featureFlags.cinematicManifesto ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-600" />}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Alternative Tokenomics Graph Rates</span>
                <span className="text-[9px] text-gray-500">Switches baseline rewards staking coefficient scaling.</span>
              </div>
              <button onClick={() => handleToggleFlag("abTestEconomicsRate")} className="text-pink-400 hover:text-pink-300">
                {featureFlags.abTestEconomicsRate ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-600" />}
              </button>
            </div>
          </div>

          <div className="text-[9px] font-mono text-gray-500 border-t border-white/5 pt-3 flex justify-between">
            <span>Last Updated By: {featureFlags.updatedBy}</span>
            <span>{new Date(featureFlags.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
