"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Check, X, ArrowUp, ArrowDown, Eye, EyeOff, Layout, AlertCircle, RefreshCw } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { getOrCreateUserProfile, UserProfile, hasRoleAccess } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";
import { saveGeneralContent } from "@/config/generalContent";
import { saveCardContent } from "@/config/cardContent";

interface PendingChange {
  id: string;
  type: "general" | "cards";
  proposedContent: any;
  updatedBy: string;
  updatedAt: string;
  timestamp: number;
}

interface PageSection {
  id: string;
  name: string;
  visible: boolean;
}

const defaultHomeSections: PageSection[] = [
  { id: "hero", name: "Hero Section", visible: true },
  { id: "ageOfIntelligence", name: "Age of Intelligence", visible: true },
  { id: "vision", name: "Vision Section", visible: true },
  { id: "problem", name: "Problem Section", visible: true },
  { id: "coreArchitecture", name: "Core Architecture Flow", visible: true },
  { id: "agents", name: "Agent Ecosystem Catalog", visible: true },
  { id: "technology", name: "Tech Stack Modules", visible: true },
  { id: "sectors", name: "Sectors Grid", visible: true },
  { id: "economics", name: "Network Revenue Economics", visible: true },
  { id: "roadmap", name: "Development Roadmap", visible: true },
  { id: "research", name: "Research Publications List", visible: true },
  { id: "join", name: "Join Network Form", visible: true },
  { id: "manifesto", name: "Manifesto Cinematic Reveal", visible: true }
];

export default function AdminApprovalsBuilder() {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [homeSections, setHomeSections] = useState<PageSection[]>([]);
  const [activeTab, setActiveTab] = useState<"approvals" | "builder">("approvals");
  const [loadingChanges, setLoadingChanges] = useState(true);
  const [loadingBuilder, setLoadingBuilder] = useState(true);

  // Fetch Current Profile
  useEffect(() => {
    async function loadCurrent() {
      const user = auth.currentUser;
      if (user) {
        const prof = await getOrCreateUserProfile(user.uid, user.email || "");
        setCurrentUserProfile(prof);
      }
    }
    loadCurrent();
  }, []);

  // Sync Pending Changes collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pending_changes"), (snapshot) => {
      const list: PendingChange[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as PendingChange);
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      setPendingChanges(list);
      setLoadingChanges(false);
    }, (err) => {
      console.error("Pending changes sync failed:", err);
      setLoadingChanges(false);
    });

    return unsubscribe;
  }, []);

  // Sync Page Builder Layout
  useEffect(() => {
    const docRef = doc(db, "website_pages", "home");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHomeSections(data.sections || defaultHomeSections);
      } else {
        setDoc(docRef, { sections: defaultHomeSections }).catch(console.error);
        setHomeSections(defaultHomeSections);
      }
      setLoadingBuilder(false);
    }, (err) => {
      console.error("Page builder config sync failed:", err);
      setLoadingBuilder(false);
    });

    return unsubscribe;
  }, []);

  // Approve and publish changes
  const handleApprove = async (change: PendingChange) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "reviewer")) {
      alert("Permission Denied. Reviewer or Admin permissions required.");
      return;
    }

    if (confirm(`Approve and publish changes submitted by ${change.updatedBy}?`)) {
      try {
        if (change.type === "general") {
          saveGeneralContent(change.proposedContent);
        } else if (change.type === "cards") {
          saveCardContent(change.proposedContent);
        }

        // Delete from pending collection
        await deleteDoc(doc(db, "pending_changes", change.id));
        alert("Changes approved and published to production!");
        
        await logActivity(
          "APPROVE_CHANGES",
          `Approved and published pending ${change.type} changes submitted by ${change.updatedBy}`
        );
        await addNotification(
          "CHANGES_APPROVED",
          `Pending ${change.type} modifications submitted by ${change.updatedBy} were published by ${currentUserProfile.email}`
        );
      } catch (err: any) {
        alert("Failed to approve changes: " + err.message);
      }
    }
  };

  // Reject and remove pending changes
  const handleReject = async (change: PendingChange) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "reviewer")) {
      alert("Permission Denied. Reviewer permissions required.");
      return;
    }

    if (confirm(`Reject changes submitted by ${change.updatedBy}?`)) {
      try {
        await deleteDoc(doc(db, "pending_changes", change.id));
        alert("Proposed modifications rejected and discarded.");
        
        await logActivity(
          "REJECT_CHANGES",
          `Rejected pending ${change.type} changes submitted by ${change.updatedBy}`
        );
        await addNotification(
          "CHANGES_REJECTED",
          `Pending ${change.type} modifications from ${change.updatedBy} were rejected by ${currentUserProfile.email}`
        );
      } catch (err: any) {
        alert("Failed to reject changes: " + err.message);
      }
    }
  };

  // Move layout builder section up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const list = [...homeSections];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    setHomeSections(list);
  };

  // Move layout builder section down
  const handleMoveDown = (index: number) => {
    if (index === homeSections.length - 1) return;
    const list = [...homeSections];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    setHomeSections(list);
  };

  // Toggle visibility of section
  const handleToggleVisibility = (index: number) => {
    const list = [...homeSections];
    list[index] = { ...list[index], visible: !list[index].visible };
    setHomeSections(list);
  };

  // Save Page Builder layout to production
  const handleSaveLayout = async () => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "editor")) {
      alert("Permission Denied.");
      return;
    }

    try {
      const docRef = doc(db, "website_pages", "home");
      await setDoc(docRef, { sections: homeSections });
      alert("Website homepage layout configuration updated successfully!");
      
      await logActivity("UPDATE_HOMEPAGE_LAYOUT", "Modified order or visibility of homepage sections.");
      await addNotification("LAYOUT_UPDATED", `Homepage structure was updated by ${currentUserProfile.email}`);
    } catch (err: any) {
      alert("Failed to save layout configuration: " + err.message);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl">Approvals & Page Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Review pending layout changes and re-order or toggle homepage components.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("approvals")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "approvals" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Pending Approvals
          </button>
          <button
            onClick={() => setActiveTab("builder")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "builder" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Layout className="w-4 h-4" />
            Homepage Builder
          </button>
        </div>
      </header>

      {/* WORKSPACE TAB: APPROVALS */}
      {activeTab === "approvals" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <ClipboardCheck className="w-5 h-5 text-[#7DD3FC]" />
            <h2 className="font-heading font-bold text-lg text-white">Pending Change Requests</h2>
          </div>

          {loadingChanges ? (
            <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing pending changes...</div>
          ) : pendingChanges.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <Check className="w-12 h-12 text-emerald-500/80 bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20" />
              <p className="text-sm text-gray-500 mt-2">All changes approved! Production matches latest edits.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {pendingChanges.map((change) => (
                <div 
                  key={change.id}
                  className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-500/10 text-[#7DD3FC] border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {change.type === "general" ? "Website Sections" : "Card Collections"}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(change.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-sm">
                      Proposed layout revisions submitted by <span className="text-[#7DD3FC]">{change.updatedBy}</span>
                    </h3>
                    <p className="text-xs text-gray-500 leading-normal">
                      Contains complete nested config parameters ready for production. Review changes before publishing.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleReject(change)}
                      className="flex items-center gap-1.5 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 text-xs font-semibold px-4 py-2.5 rounded-lg text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Reject Edits
                    </button>
                    <button
                      onClick={() => handleApprove(change)}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs px-4 py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE TAB: HOMEPAGE BUILDER */}
      {activeTab === "builder" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-white">Homepage Layout Builder</h2>
              <p className="text-xs text-gray-500 mt-0.5">Toggle visibility or change rendering order of sections on the website homepage.</p>
            </div>
            <button
              onClick={handleSaveLayout}
              className="flex items-center gap-1.5 bg-[#4D7CFE] hover:bg-[#3b66d9] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer shrink-0"
            >
              <Check className="w-4 h-4" /> SAVE BUILDER LAYOUT
            </button>
          </div>

          {loadingBuilder ? (
            <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing builder layout...</div>
          ) : (
            <div className="glass-card p-4 rounded-2xl border border-white/10 bg-[#030712]/30 flex flex-col gap-2 max-w-2xl mx-auto w-full">
              {homeSections.map((sec, idx) => (
                <div 
                  key={sec.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    sec.visible 
                      ? "bg-white/[0.02] border-white/5 text-white" 
                      : "bg-black/40 border-white/[0.02] text-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-gray-500">0{idx + 1}</span>
                    <span className={`text-xs font-semibold ${sec.visible ? "text-white" : "text-gray-600 line-through"}`}>
                      {sec.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Move Up */}
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-2 rounded border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    {/* Move Down */}
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === homeSections.length - 1}
                      className="p-2 rounded border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {/* Toggle Visible */}
                    <button
                      onClick={() => handleToggleVisibility(idx)}
                      className={`p-2 rounded border transition-colors cursor-pointer ${
                        sec.visible 
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                          : "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
