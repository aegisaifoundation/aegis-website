"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, Save, Trash2, History, Check, ArrowRight, RotateCcw, AlertCircle } from "lucide-react";
import { CardContent, defaultCardContent, readCardContent, saveCardContent } from "@/config/cardContent";
import { GeneralContent, defaultGeneralContent, readGeneralContent, saveGeneralContent } from "@/config/generalContent";
import { auth, db } from "@/config/firebase";
import { collection, addDoc, onSnapshot, getDocs, doc, setDoc, query, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getOrCreateUserProfile, UserProfile, hasRoleAccess } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";

type CollectionKey = keyof CardContent;
type Tab =
  | "card-technology" | "card-sectors" | "card-revenue" | "card-agents" | "card-agentFaqs"
  | "section-navbarFooter" | "section-hero" | "section-ageOfIntelligence" | "section-vision" | "section-problem" | "section-coreArchitecture" | "section-research" | "section-roadmap" | "section-joinNetwork" | "section-manifesto"
  | "section-sectors" | "section-economics" | "section-technology" | "section-agents"
  | "version-history";

const cardLabels: Record<CollectionKey, string> = {
  technology: "Technology cards",
  sectors: "Sector cards",
  revenue: "Revenue cards",
  agents: "Agent ecosystem cards",
  agentFaqs: "Agent ecosystem FAQs",
};

const sectionLabels: Record<string, string> = {
  navbarFooter: "Header & Footer",
  hero: "Hero Section",
  ageOfIntelligence: "Age of Intelligence",
  vision: "Vision Section",
  problem: "Problem Section",
  coreArchitecture: "Core Architecture",
  research: "Research Section",
  roadmap: "Roadmap Section",
  joinNetwork: "Join Network",
  manifesto: "Manifesto Section",
  sectors: "Sectors Section Header",
  economics: "Economics Section Header",
  technology: "Tech Stack Header",
  agents: "Agents Section Header",
};

const newCardItem = (collection: CollectionKey) => {
  const id = `new-${Date.now()}`;
  if (collection === "technology") return { id, title: "New technology", desc: "Describe this technology.", spec: "Protocol specification" };
  if (collection === "revenue") return { id, title: "New revenue model", desc: "Describe this revenue model." };
  if (collection === "agents") return { id, title: "New agent", class: "AEGIS-NEW-01", desc: "Describe this agent.", inputs: "Data source", consensus: "Describe consensus.", coordination: "Related Agent", kpis: "Metric|Value" };
  if (collection === "agentFaqs") return { id, question: "New question", answer: "Add the answer." };
  return { id, title: "New sector", category: "Healthcare", problem: "Describe the problem.", benefits: "Describe the benefit.", revenue: "$0 potential size", details: "Add details." };
};

export default function AdminContentEditor() {
  const [content, setContent] = useState<CardContent>(() => typeof window !== "undefined" ? readCardContent() : defaultCardContent);
  const [generalContent, setGeneralContent] = useState<GeneralContent>(() => typeof window !== "undefined" ? readGeneralContent() : defaultGeneralContent);
  const [tab, setTab] = useState<Tab>("card-technology");
  const [selectedId, setSelectedId] = useState<string>("");
  
  // Status states
  const [saved, setSaved] = useState(false);
  const [approvalSubmitted, setApprovalSubmitted] = useState(false);
  
  // Auth state
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  // Version History state
  const [versions, setVersions] = useState<any[]>([]);
  const [compareVersion, setCompareVersion] = useState<any | null>(null);

  // Fetch Current user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const prof = await getOrCreateUserProfile(user.uid, user.email || "");
        setCurrentUserProfile(prof);
      }
    });
    return unsubscribe;
  }, []);

  // Sync state on default reset events
  useEffect(() => {
    const sync = () => {
      setContent(readCardContent());
      setGeneralContent(readGeneralContent());
      setSaved(false);
      setApprovalSubmitted(false);
    };
    window.addEventListener("aegis-content-reset", sync);
    return () => window.removeEventListener("aegis-content-reset", sync);
  }, []);

  // Sync Version History list from Firestore
  useEffect(() => {
    if (tab !== "version-history") return;

    const q = query(
      collection(db, "website_versions"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setVersions(list);
    }, (err) => console.error("Versions sync failed:", err));

    return unsubscribe;
  }, [tab]);

  // Determine current active card collection key
  const activeCollectionKey = useMemo<CollectionKey | null>(() => {
    if (tab.startsWith("card-")) {
      return tab.replace("card-", "") as CollectionKey;
    }
    return null;
  }, [tab]);

  // Set default selected card when collection tab changes
  useEffect(() => {
    if (activeCollectionKey) {
      setSelectedId(content[activeCollectionKey]?.[0]?.id || "");
    }
  }, [tab, activeCollectionKey, content]);

  const cards = activeCollectionKey ? content[activeCollectionKey] : [];
  const selectedCard = useMemo(() => {
    if (!activeCollectionKey) return null;
    return cards.find((card) => card.id === selectedId) || cards[0];
  }, [cards, selectedId, activeCollectionKey]);

  // Card Content updates
  const updateSelectedCard = (field: string, value: string) => {
    if (!selectedCard || !activeCollectionKey) return;
    setSaved(false);
    setApprovalSubmitted(false);
    setContent((current) => ({
      ...current,
      [activeCollectionKey]: current[activeCollectionKey].map((card) =>
        card.id === selectedCard.id ? { ...card, [field]: value } : card
      ),
    } as CardContent));
  };

  const addCard = () => {
    if (!activeCollectionKey) return;
    const card = newCardItem(activeCollectionKey);
    setContent((current) => ({
      ...current,
      [activeCollectionKey]: [...current[activeCollectionKey], card],
    } as CardContent));
    setSelectedId(card.id);
    setSaved(false);
    setApprovalSubmitted(false);
  };

  const deleteCard = () => {
    if (!selectedCard || !activeCollectionKey) return;
    if (confirm("Are you sure you want to delete this card?")) {
      const nextContent = {
        ...content,
        [activeCollectionKey]: content[activeCollectionKey].filter((card) => card.id !== selectedCard.id),
      } as CardContent;
      setContent(nextContent);
      setSelectedId(nextContent[activeCollectionKey]?.[0]?.id || "");
      setSaved(false);
      setApprovalSubmitted(false);
    }
  };

  // General Content fields updates
  const updateGeneralField = (section: keyof GeneralContent, field: string, value: any) => {
    setSaved(false);
    setApprovalSubmitted(false);
    setGeneralContent((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  // General Content list arrays updates
  const updateGeneralArrayItem = (section: keyof GeneralContent, field: string, index: number, subField: string, value: any) => {
    setSaved(false);
    setApprovalSubmitted(false);
    setGeneralContent((current) => {
      const list = [...(current[section] as any)[field]];
      list[index] = { ...list[index], [subField]: value };
      return {
        ...current,
        [section]: {
          ...current[section],
          [field]: list,
        },
      };
    });
  };

  // General Content string lists (manifesto statements)
  const updateGeneralStringArrayItem = (section: keyof GeneralContent, field: string, index: number, value: string) => {
    setSaved(false);
    setApprovalSubmitted(false);
    setGeneralContent((current) => {
      const list = [...(current[section] as any)[field]];
      list[index] = value;
      return {
        ...current,
        [section]: {
          ...current[section],
          [field]: list,
        },
      };
    });
  };

  const saveAll = async () => {
    if (!currentUserProfile) return;

    const isEditor = currentUserProfile.role === "editor" || currentUserProfile.role === "reviewer";

    if (isEditor) {
      // Approval workflow: write to pending_changes collection instead of production
      try {
        await addDoc(collection(db, "pending_changes"), {
          type: "general",
          proposedContent: generalContent,
          updatedBy: currentUserProfile.email,
          updatedAt: new Date().toISOString(),
          timestamp: Date.now(),
        });
        await addDoc(collection(db, "pending_changes"), {
          type: "cards",
          proposedContent: content,
          updatedBy: currentUserProfile.email,
          updatedAt: new Date().toISOString(),
          timestamp: Date.now(),
        });

        setApprovalSubmitted(true);
        setSaved(false);
        await logActivity("SUBMIT_FOR_APPROVAL", `Submitted general and card edits to approvals queue.`);
        await addNotification("PENDING_CHANGES", `New website modifications submitted by editor ${currentUserProfile.email}`);
      } catch (err: any) {
        alert("Failed to submit changes to queue: " + err.message);
      }
    } else if (hasRoleAccess(currentUserProfile.role, "admin")) {
      // Super Admin and Admin save directly to production
      await saveCardContent(content);
      await saveGeneralContent(generalContent);
      setSaved(true);
      setApprovalSubmitted(false);
      
      await logActivity("UPDATE_CONTENT_DIRECT", "Saved general website content configurations directly to production.");
    }
  };

  // Restore previous version
  const handleRestoreVersion = async (version: any) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "super_admin")) {
      alert("Permission Denied. Only Super Admins can restore previous versions.");
      return;
    }

    if (confirm(`Restore website content back to version from ${new Date(version.timestamp).toLocaleString()}?`)) {
      try {
        if (version.type === "general") {
          await saveGeneralContent(version.content);
          setGeneralContent(version.content);
        } else if (version.type === "cards") {
          await saveCardContent(version.content);
          setContent(version.content);
        }

        alert("Version restored successfully!");
        setCompareVersion(null);
        
        await logActivity(
          "RESTORE_VERSION",
          `Restored website ${version.type} content to backup version from ${version.updatedAt}`
        );
      } catch (err: any) {
        alert("Failed to restore version: " + err.message);
      }
    }
  };

  const fields = selectedCard ? Object.entries(selectedCard).filter(([key]) => key !== "id") : [];
  const isWritable = currentUserProfile && hasRoleAccess(currentUserProfile.role, "editor");
  const isViewer = currentUserProfile && currentUserProfile.role === "viewer";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-white/10 pb-5">
        <div>
          <h1 className="font-heading font-bold text-2xl">Website Content Customizer</h1>
          <p className="text-xs text-gray-500 mt-1">Configure both card lists and page components dynamically.</p>
        </div>
        
        {currentUserProfile && !isViewer && (
          <button
            onClick={saveAll}
            className="flex items-center justify-center gap-2 bg-[#4D7CFE] hover:bg-[#3b66d9] rounded-lg px-5 py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.35)] cursor-pointer shrink-0 sm:self-center uppercase"
          >
            <Save className="w-4 h-4" /> 
            {currentUserProfile.role === "editor" || currentUserProfile.role === "reviewer" 
              ? "Submit for Approval" 
              : "Save Changes"}
          </button>
        )}
      </header>

      {/* Two Column Layout: Editor Inner Navigation vs Viewport */}
      <div className="grid lg:grid-cols-[250px_1fr] gap-6 items-start">
        {/* Inner Content Sidebar */}
        <aside className="glass-card p-3 flex flex-col gap-5 bg-[#030712]/40 border border-white/5 rounded-xl">
          <div>
            <p className="px-3 py-1.5 text-[9px] font-bold tracking-widest text-[#7DD3FC] uppercase">Card Lists</p>
            <div className="flex flex-col gap-1 mt-1">
              {(Object.keys(cardLabels) as CollectionKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(`card-${key}` as Tab)}
                  className={`block text-left w-full rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                    tab === `card-${key}`
                      ? "bg-white/10 text-white font-semibold"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {cardLabels[key]}
                  <span className="float-right opacity-60 bg-white/5 px-1.5 py-0.5 rounded font-mono text-[9px]">
                    {content[key].length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 py-1.5 text-[9px] font-bold tracking-widest text-[#7DD3FC] uppercase">Page Sections</p>
            <div className="flex flex-col gap-1 mt-1">
              {Object.keys(sectionLabels).map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(`section-${key}` as Tab)}
                  className={`block text-left w-full rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                    tab === `section-${key}`
                      ? "bg-white/10 text-white font-semibold"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {sectionLabels[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-3">
            <button
              onClick={() => setTab("version-history")}
              className={`flex items-center gap-2 text-left w-full rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                tab === "version-history"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Version History
            </button>
          </div>
        </aside>

        {/* Editing Workspace Pane */}
        <div className="flex flex-col gap-4 min-h-[50vh]">
          {saved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-lg flex items-center justify-between">
              <span>All updates saved successfully! Refresh the public homepage to inspect changes.</span>
            </div>
          )}

          {approvalSubmitted && (
            <div className="bg-blue-500/10 border border-blue-500/30 text-[#7DD3FC] text-xs px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Your edits have been successfully submitted to the pending approvals queue! A reviewer or administrator will publish them shortly.</span>
            </div>
          )}

          {/* IF CARD COLLECTIONS SELECTED */}
          {activeCollectionKey && (
            <div className="grid xl:grid-cols-[250px_1fr] gap-5 items-start">
              {/* Card List selector */}
              <div className="glass-card p-3 max-h-[60vh] overflow-y-auto border border-white/5 bg-[#030712]/30 rounded-xl">
                <div className="flex justify-between items-center px-2 py-1 mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Items</span>
                  {isWritable && (
                    <button
                      onClick={addCard}
                      className="flex items-center gap-1 text-[10px] text-[#7DD3FC] font-semibold hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" /> ADD NEW
                    </button>
                  )}
                </div>
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedId(card.id)}
                    className={`block w-full text-left p-3 rounded-lg mb-1 transition-all cursor-pointer ${
                      card.id === selectedCard?.id ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="block text-xs font-semibold truncate">
                      {"title" in card ? card.title : card.question}
                    </span>
                    <span className="block text-[10px] text-gray-500 truncate mt-0.5">
                      {"desc" in card ? card.desc : "problem" in card ? card.problem : "answer" in card ? card.answer : ""}
                    </span>
                  </button>
                ))}
              </div>

              {/* Card Form editing panel */}
              <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl">
                {selectedCard ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mb-2">
                      <div>
                        <span className="text-[9px] font-bold tracking-widest text-[#7DD3FC] uppercase">Edit Card Data</span>
                        <h2 className="font-heading font-bold text-lg mt-1 text-white">
                          {"title" in selectedCard ? selectedCard.title : selectedCard.question}
                        </h2>
                      </div>
                      {isWritable && (
                        <button
                          onClick={deleteCard}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Card
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4">
                      {fields.map(([field, value]) => (
                        <div key={field} className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">{field}</label>
                          {String(value).length > 70 || ["desc", "problem", "benefits", "details", "answer"].includes(field) ? (
                            <textarea
                              value={String(value)}
                              onChange={(e) => updateSelectedCard(field, e.target.value)}
                              disabled={!isWritable}
                              rows={field === "details" ? 5 : 3}
                              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                            />
                          ) : (
                            <input
                              value={String(value)}
                              onChange={(e) => updateSelectedCard(field, e.target.value)}
                              disabled={!isWritable}
                              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-gray-500">
                    No card items found. Click ADD NEW to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: NAVBAR & FOOTER */}
          {tab === "section-navbarFooter" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Header & Footer Global Settings</h2>

              <div className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Navbar Logo Title</label>
                    <input
                      value={generalContent.navbar.logoText}
                      onChange={(e) => updateGeneralField("navbar", "logoText", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Navbar CTA Text</label>
                    <input
                      value={generalContent.navbar.ctaText}
                      onChange={(e) => updateGeneralField("navbar", "ctaText", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Footer Subtitle Tagline</label>
                    <input
                      value={generalContent.footer.subtitle}
                      onChange={(e) => updateGeneralField("footer", "subtitle", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Footer Copyright Text</label>
                    <input
                      value={generalContent.footer.copyrightText}
                      onChange={(e) => updateGeneralField("footer", "copyrightText", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Footer Short Description</label>
                  <textarea
                    value={generalContent.footer.description}
                    onChange={(e) => updateGeneralField("footer", "description", e.target.value)}
                    disabled={!isWritable}
                    rows={3}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: HERO SECTION */}
          {tab === "section-hero" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Hero Component Content</h2>

              <div className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Hero Badge / Subtitle</label>
                    <input
                      value={generalContent.hero.subtitle}
                      onChange={(e) => updateGeneralField("hero", "subtitle", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Hero Main H1 Title</label>
                    <input
                      value={generalContent.hero.title}
                      onChange={(e) => updateGeneralField("hero", "title", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Hero Body Description</label>
                  <input
                    value={generalContent.hero.description}
                    onChange={(e) => updateGeneralField("hero", "description", e.target.value)}
                    disabled={!isWritable}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Primary Button Text (Explore)</label>
                    <input
                      value={generalContent.hero.exploreBtnText}
                      onChange={(e) => updateGeneralField("hero", "exploreBtnText", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Secondary Button Text (Join)</label>
                    <input
                      value={generalContent.hero.joinBtnText}
                      onChange={(e) => updateGeneralField("hero", "joinBtnText", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Hero Exit Transition Quote (Cognitive Bridge)</label>
                  <input
                    value={generalContent.hero.cognitiveBridgeQuote}
                    onChange={(e) => updateGeneralField("hero", "cognitiveBridgeQuote", e.target.value)}
                    disabled={!isWritable}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: AGE OF INTELLIGENCE */}
          {tab === "section-ageOfIntelligence" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Age of Intelligence Component</h2>

              <div className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Header Badge</label>
                    <input
                      value={generalContent.ageOfIntelligence.badge}
                      onChange={(e) => updateGeneralField("ageOfIntelligence", "badge", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Badge Description Line</label>
                    <input
                      value={generalContent.ageOfIntelligence.description}
                      onChange={(e) => updateGeneralField("ageOfIntelligence", "description", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Left Column Badge</label>
                    <input
                      value={generalContent.ageOfIntelligence.leftBadge}
                      onChange={(e) => updateGeneralField("ageOfIntelligence", "leftBadge", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Left Column Title (newlines render breaks)</label>
                    <textarea
                      value={generalContent.ageOfIntelligence.leftTitle}
                      onChange={(e) => updateGeneralField("ageOfIntelligence", "leftTitle", e.target.value)}
                      disabled={!isWritable}
                      rows={3}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Core Paragraph Blocks (use double returns for paragraph breaks)</label>
                  <textarea
                    value={generalContent.ageOfIntelligence.paragraphs}
                    onChange={(e) => updateGeneralField("ageOfIntelligence", "paragraphs", e.target.value)}
                    disabled={!isWritable}
                    rows={6}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                  />
                </div>

                {/* Metrics editor */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 border-b border-white/5 pb-2">Statistical Metrics</h3>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {generalContent.ageOfIntelligence.metrics.map((metric, idx) => (
                      <div key={idx} className="border border-white/5 bg-white/[0.01] p-3 rounded-lg flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-[#7DD3FC]">METRIC {idx + 1}</span>
                        <input
                          value={metric.value}
                          onChange={(e) => updateGeneralArrayItem("ageOfIntelligence", "metrics", idx, "value", e.target.value)}
                          disabled={!isWritable}
                          placeholder="Value (e.g. 100B+)"
                          className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-[11px] outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                        />
                        <input
                          value={metric.label}
                          onChange={(e) => updateGeneralArrayItem("ageOfIntelligence", "metrics", idx, "label", e.target.value)}
                          disabled={!isWritable}
                          placeholder="Label (e.g. Nodes)"
                          className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-[11px] outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blocks editor */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 border-b border-white/5 pb-2">Bottom Highlights</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {generalContent.ageOfIntelligence.blocks.map((block, idx) => (
                      <div key={idx} className="border border-white/5 bg-white/[0.01] p-3 rounded-lg flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-purple-400">BLOCK {idx + 1}</span>
                        <input
                          value={block.title}
                          onChange={(e) => updateGeneralArrayItem("ageOfIntelligence", "blocks", idx, "title", e.target.value)}
                          disabled={!isWritable}
                          placeholder="Title"
                          className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                        />
                        <textarea
                          value={block.desc}
                          onChange={(e) => updateGeneralArrayItem("ageOfIntelligence", "blocks", idx, "desc", e.target.value)}
                          disabled={!isWritable}
                          placeholder="Description"
                          rows={3}
                          className="w-full rounded bg-white/5 border border-white/10 p-2 text-[11px] outline-none text-white focus:border-[#4D7CFE] leading-normal disabled:opacity-50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: VISION */}
          {tab === "section-vision" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Vision Component</h2>

              <div className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Badge</label>
                    <input
                      value={generalContent.vision.badge}
                      onChange={(e) => updateGeneralField("vision", "badge", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Title (use breaking strings)</label>
                    <textarea
                      value={generalContent.vision.title}
                      onChange={(e) => updateGeneralField("vision", "title", e.target.value)}
                      disabled={!isWritable}
                      rows={2}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-normal disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Highlight Tagline Text</label>
                    <input
                      value={generalContent.vision.highlight}
                      onChange={(e) => updateGeneralField("vision", "highlight", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Learn More Link CTA</label>
                    <input
                      value={generalContent.vision.ctaText}
                      onChange={(e) => updateGeneralField("vision", "ctaText", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Feature cards editor */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 border-b border-white/5 pb-2">Vision Cards</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {generalContent.vision.cards.map((card, idx) => (
                      <div key={idx} className="border border-white/5 bg-white/[0.01] p-3 rounded-lg flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-[#7DD3FC]">CARD {idx + 1}</span>
                        <input
                          value={card.title}
                          onChange={(e) => updateGeneralArrayItem("vision", "cards", idx, "title", e.target.value)}
                          disabled={!isWritable}
                          placeholder="Card Title"
                          className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                        />
                        <textarea
                          value={card.text}
                          onChange={(e) => updateGeneralArrayItem("vision", "cards", idx, "text", e.target.value)}
                          disabled={!isWritable}
                          placeholder="Card Description"
                          rows={4}
                          className="w-full rounded bg-white/5 border border-white/10 p-2 text-[11px] outline-none text-white focus:border-[#4D7CFE] leading-normal disabled:opacity-50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: PROBLEM */}
          {tab === "section-problem" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Problem Component</h2>

              <div className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Badge</label>
                    <input
                      value={generalContent.problem.badge}
                      onChange={(e) => updateGeneralField("problem", "badge", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Title (use breaks)</label>
                    <textarea
                      value={generalContent.problem.title}
                      onChange={(e) => updateGeneralField("problem", "title", e.target.value)}
                      disabled={!isWritable}
                      rows={2}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-normal disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Description Paragraph</label>
                  <textarea
                    value={generalContent.problem.description}
                    onChange={(e) => updateGeneralField("problem", "description", e.target.value)}
                    disabled={!isWritable}
                    rows={3}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Quote Banner Text</label>
                    <input
                      value={generalContent.problem.quote}
                      onChange={(e) => updateGeneralField("problem", "quote", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Learn More CTA</label>
                    <input
                      value={generalContent.problem.ctaText}
                      onChange={(e) => updateGeneralField("problem", "ctaText", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Requirements list */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 border-b border-white/5 pb-2">Requirements List</h3>
                  <div className="flex flex-col gap-3">
                    {generalContent.problem.requirements.map((req, idx) => (
                      <div key={idx} className="border border-white/5 bg-white/[0.01] p-3 rounded-lg grid sm:grid-cols-[200px_1fr] gap-3 items-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-red-400">REQ {idx + 1}</span>
                          <input
                            value={req.name}
                            onChange={(e) => updateGeneralArrayItem("problem", "requirements", idx, "name", e.target.value)}
                            disabled={!isWritable}
                            placeholder="Requirement Name"
                            className="w-full rounded bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">Description</span>
                          <input
                            value={req.desc}
                            onChange={(e) => updateGeneralArrayItem("problem", "requirements", idx, "desc", e.target.value)}
                            disabled={!isWritable}
                            placeholder="Description details"
                            className="w-full rounded bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: CORE ARCHITECTURE */}
          {tab === "section-coreArchitecture" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Core Architecture</h2>

              <div className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Badge</label>
                    <input
                      value={generalContent.coreArchitecture.badge}
                      onChange={(e) => updateGeneralField("coreArchitecture", "badge", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Title</label>
                    <input
                      value={generalContent.coreArchitecture.title}
                      onChange={(e) => updateGeneralField("coreArchitecture", "title", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Description Paragraph</label>
                  <textarea
                    value={generalContent.coreArchitecture.description}
                    onChange={(e) => updateGeneralField("coreArchitecture", "description", e.target.value)}
                    disabled={!isWritable}
                    rows={2}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Central Statement</label>
                    <textarea
                      value={generalContent.coreArchitecture.statement}
                      onChange={(e) => updateGeneralField("coreArchitecture", "statement", e.target.value)}
                      disabled={!isWritable}
                      rows={2}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-normal disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:justify-end">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Learn More CTA</label>
                    <input
                      value={generalContent.coreArchitecture.ctaText}
                      onChange={(e) => updateGeneralField("coreArchitecture", "ctaText", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Architecture Steps list */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 border-b border-white/5 pb-2">Stages Flow Architecture</h3>
                  <div className="flex flex-col gap-3">
                    {generalContent.coreArchitecture.steps.map((step, idx) => (
                      <div key={idx} className="border border-white/5 bg-white/[0.01] p-3 rounded-lg grid sm:grid-cols-[200px_1fr] gap-3 items-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-blue-400">STAGE 0{idx + 1}</span>
                          <input
                            value={step.title}
                            onChange={(e) => updateGeneralArrayItem("coreArchitecture", "steps", idx, "title", e.target.value)}
                            disabled={!isWritable}
                            placeholder="Stage Title"
                            className="w-full rounded bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">Description</span>
                          <input
                            value={step.desc}
                            onChange={(e) => updateGeneralArrayItem("coreArchitecture", "steps", idx, "desc", e.target.value)}
                            disabled={!isWritable}
                            placeholder="Stage Description Details"
                            className="w-full rounded bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: RESEARCH */}
          {tab === "section-research" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Research Section Header</h2>

              <div className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Badge</label>
                    <input
                      value={generalContent.research.badge}
                      onChange={(e) => updateGeneralField("research", "badge", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Title</label>
                    <input
                      value={generalContent.research.title}
                      onChange={(e) => updateGeneralField("research", "title", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Description Paragraph</label>
                    <textarea
                      value={generalContent.research.description}
                      onChange={(e) => updateGeneralField("research", "description", e.target.value)}
                      disabled={!isWritable}
                      rows={2}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:justify-end">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Repository CTA Link</label>
                    <input
                      value={generalContent.research.ctaText}
                      onChange={(e) => updateGeneralField("research", "ctaText", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ROADMAP */}
          {tab === "section-roadmap" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Roadmap Development Pipeline</h2>

              <div className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Badge</label>
                    <input
                      value={generalContent.roadmap.badge}
                      onChange={(e) => updateGeneralField("roadmap", "badge", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Title</label>
                    <input
                      value={generalContent.roadmap.title}
                      onChange={(e) => updateGeneralField("roadmap", "title", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Description Paragraph</label>
                    <textarea
                      value={generalContent.roadmap.description}
                      onChange={(e) => updateGeneralField("roadmap", "description", e.target.value)}
                      disabled={!isWritable}
                      rows={2}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:justify-end">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Pipeline Details CTA</label>
                    <input
                      value={generalContent.roadmap.ctaText}
                      onChange={(e) => updateGeneralField("roadmap", "ctaText", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Steps timeline editor */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 border-b border-white/5 pb-2">Roadmap Timeline Nodes</h3>
                  <div className="flex flex-col gap-3">
                    {generalContent.roadmap.steps.map((step, idx) => (
                      <div key={idx} className="border border-white/5 bg-white/[0.01] p-3 rounded-lg grid sm:grid-cols-[120px_200px_1fr] gap-3 items-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-amber-400">YEAR / TIME</span>
                          <input
                            value={step.year}
                            onChange={(e) => updateGeneralArrayItem("roadmap", "steps", idx, "year", e.target.value)}
                            disabled={!isWritable}
                            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">Milestone Title</span>
                          <input
                            value={step.title}
                            onChange={(e) => updateGeneralArrayItem("roadmap", "steps", idx, "title", e.target.value)}
                            disabled={!isWritable}
                            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">Summary details</span>
                          <input
                            value={step.desc}
                            onChange={(e) => updateGeneralArrayItem("roadmap", "steps", idx, "desc", e.target.value)}
                            disabled={!isWritable}
                            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: JOIN NETWORK */}
          {tab === "section-joinNetwork" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Join Network Form Settings</h2>

              <div className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Badge</label>
                    <input
                      value={generalContent.joinNetwork.badge}
                      onChange={(e) => updateGeneralField("joinNetwork", "badge", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Title</label>
                    <input
                      value={generalContent.joinNetwork.title}
                      onChange={(e) => updateGeneralField("joinNetwork", "title", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Form Description Text</label>
                    <textarea
                      value={generalContent.joinNetwork.description}
                      onChange={(e) => updateGeneralField("joinNetwork", "description", e.target.value)}
                      disabled={!isWritable}
                      rows={2}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-normal disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:justify-end">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Submit Button text</label>
                    <input
                      value={generalContent.joinNetwork.submitText}
                      onChange={(e) => updateGeneralField("joinNetwork", "submitText", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Success Message Header</label>
                    <input
                      value={generalContent.joinNetwork.successTitle}
                      onChange={(e) => updateGeneralField("joinNetwork", "successTitle", e.target.value)}
                      disabled={!isWritable}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Success Detail Text</label>
                    <textarea
                      value={generalContent.joinNetwork.successDesc}
                      onChange={(e) => updateGeneralField("joinNetwork", "successDesc", e.target.value)}
                      disabled={!isWritable}
                      rows={2}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-normal disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: MANIFESTO */}
          {tab === "section-manifesto" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">The Aegis Manifesto</h2>

              <div className="grid gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Badge</label>
                  <input
                    value={generalContent.manifesto.badge}
                    onChange={(e) => updateGeneralField("manifesto", "badge", e.target.value)}
                    disabled={!isWritable}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                  />
                </div>

                {/* Statements list */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 border-b border-white/5 pb-2">Manifesto Cinematic Reveal Lines</h3>
                  <div className="flex flex-col gap-3">
                    {generalContent.manifesto.statements.map((stmt, idx) => (
                      <div key={idx} className="flex flex-col gap-1 border border-white/5 bg-white/[0.01] p-3 rounded-lg">
                        <span className="text-[9px] font-bold text-[#7DD3FC]">LINE {idx + 1}</span>
                        <input
                          value={stmt}
                          onChange={(e) => updateGeneralStringArrayItem("manifesto", "statements", idx, e.target.value)}
                          disabled={!isWritable}
                          className="w-full rounded bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs outline-none text-white focus:border-[#4D7CFE] disabled:opacity-50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: SECTORS SECTION HEADER */}
          {tab === "section-sectors" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Sectors Section Header</h2>
              <div className="grid gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Badge</label>
                  <input
                    value={generalContent.sectors.badge}
                    onChange={(e) => updateGeneralField("sectors", "badge", e.target.value)}
                    disabled={!isWritable}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Title</label>
                  <input
                    value={generalContent.sectors.title}
                    onChange={(e) => updateGeneralField("sectors", "title", e.target.value)}
                    disabled={!isWritable}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Description</label>
                  <textarea
                    value={generalContent.sectors.description}
                    onChange={(e) => updateGeneralField("sectors", "description", e.target.value)}
                    disabled={!isWritable}
                    rows={3}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ECONOMICS SECTION HEADER */}
          {tab === "section-economics" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Economics Section Header</h2>
              <div className="grid gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Badge</label>
                  <input
                    value={generalContent.economics.badge}
                    onChange={(e) => updateGeneralField("economics", "badge", e.target.value)}
                    disabled={!isWritable}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Title</label>
                  <input
                    value={generalContent.economics.title}
                    onChange={(e) => updateGeneralField("economics", "title", e.target.value)}
                    disabled={!isWritable}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Description</label>
                  <textarea
                    value={generalContent.economics.description}
                    onChange={(e) => updateGeneralField("economics", "description", e.target.value)}
                    disabled={!isWritable}
                    rows={3}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: TECHNOLOGY SECTION HEADER */}
          {tab === "section-technology" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Tech Stack Header</h2>
              <div className="grid gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Badge</label>
                  <input
                    value={generalContent.technology.badge}
                    onChange={(e) => updateGeneralField("technology", "badge", e.target.value)}
                    disabled={!isWritable}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Title</label>
                  <input
                    value={generalContent.technology.title}
                    onChange={(e) => updateGeneralField("technology", "title", e.target.value)}
                    disabled={!isWritable}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Description</label>
                  <textarea
                    value={generalContent.technology.description}
                    onChange={(e) => updateGeneralField("technology", "description", e.target.value)}
                    disabled={!isWritable}
                    rows={3}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: AGENTS SECTION HEADER */}
          {tab === "section-agents" && (
            <div className="glass-card p-6 border border-white/5 bg-[#030712]/20 rounded-xl flex flex-col gap-6">
              <h2 className="font-heading font-bold text-lg border-b border-white/10 pb-3 text-white">Agents Section Header</h2>
              <div className="grid gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Badge</label>
                  <input
                    value={generalContent.agents.badge}
                    onChange={(e) => updateGeneralField("agents", "badge", e.target.value)}
                    disabled={!isWritable}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Title</label>
                  <input
                    value={generalContent.agents.title}
                    onChange={(e) => updateGeneralField("agents", "title", e.target.value)}
                    disabled={!isWritable}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Section Description</label>
                  <textarea
                    value={generalContent.agents.description}
                    onChange={(e) => updateGeneralField("agents", "description", e.target.value)}
                    disabled={!isWritable}
                    rows={3}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: VERSION HISTORY */}
          {tab === "version-history" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <History className="w-5 h-5 text-[#7DD3FC]" />
                <h2 className="font-heading font-bold text-lg text-white">Version History Archive</h2>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Every direct save creates an automated snapshot. Review previous versions, compare them, and restore old configs back to production.
              </p>

              {/* Compare version pane preview */}
              {compareVersion && (
                <div className="glass-card p-6 border border-white/10 bg-[#030712]/50 flex flex-col gap-4 rounded-xl">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-[#7DD3FC]">Compare and Restore</span>
                      <h3 className="text-sm font-semibold text-white mt-0.5">
                        Backup: {compareVersion.type === "general" ? "Website Sections" : "Card Collections"} ({new Date(compareVersion.timestamp).toLocaleString()})
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCompareVersion(null)}
                        className="border border-white/10 bg-white/5 text-gray-400 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer"
                      >
                        CLOSE VIEW
                      </button>
                      {currentUserProfile && hasRoleAccess(currentUserProfile.role, "super_admin") && (
                        <button
                          onClick={() => handleRestoreVersion(compareVersion)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer"
                        >
                          RESTORE VERSION
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* JSON comparison block */}
                  <div className="max-h-60 overflow-y-auto p-4 rounded-lg bg-black/60 border border-white/5 font-mono text-[10px] text-emerald-400 whitespace-pre-wrap leading-normal">
                    {JSON.stringify(compareVersion.content, null, 2)}
                  </div>
                </div>
              )}

              {/* Versions List Table */}
              <div className="glass-card p-4 rounded-xl border border-white/10 bg-[#030712]/15">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500 font-heading text-[9px] tracking-wider uppercase font-bold">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Document</th>
                      <th className="py-2.5 px-3">Saved By</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {versions.map((ver) => (
                      <tr key={ver.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-3 px-3 text-gray-300 font-mono">
                          {new Date(ver.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            ver.type === "general" ? "bg-blue-500/10 text-[#7DD3FC]" : "bg-purple-500/10 text-purple-400"
                          }`}>
                            {ver.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-400 font-semibold">{ver.updatedBy}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setCompareVersion(ver)}
                              className="text-xs text-[#7DD3FC] hover:text-white font-bold px-2 py-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                            >
                              Compare
                            </button>
                            {currentUserProfile && hasRoleAccess(currentUserProfile.role, "super_admin") && (
                              <button
                                onClick={() => handleRestoreVersion(ver)}
                                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
