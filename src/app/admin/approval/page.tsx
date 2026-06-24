"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Check, X, ArrowUp, ArrowDown, Eye, EyeOff, Layout, AlertCircle, RefreshCw, Server, BookOpen, User, ShieldAlert } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDoc, query, orderBy, limit } from "firebase/firestore";
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

interface NodeRequest {
  id: string;
  name: string;
  email: string;
  country: string;
  institution: string;
  role: string;
  date: string;
  timestamp: number;
  status?: "pending" | "approved" | "rejected" | "quarantined";
  approvedUserId?: string;
  approvedPassword?: string;
  type?: "new_operator" | "node_registration";
  userId?: string;
  gpuSpecs?: string;
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

// Helper to generate unique userId
function generateUniqueUserId(name: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 12);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}_${rand}`;
}

// Helper to generate a random 8-char password
function generateRandomPassword(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// SHA-256 hashing helper
async function hashSHA256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function AdminApprovalsBuilder() {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "builder" | "nodes" | "research">("content");
  
  // States
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [homeSections, setHomeSections] = useState<PageSection[]>([]);
  const [nodeRequests, setNodeRequests] = useState<NodeRequest[]>([]);
  const [researchProposals, setResearchProposals] = useState<ResearchProposal[]>([]);

  const [loadingChanges, setLoadingChanges] = useState(true);
  const [loadingBuilder, setLoadingBuilder] = useState(true);
  const [loadingNodes, setLoadingNodes] = useState(true);
  const [loadingResearch, setLoadingResearch] = useState(true);

  // Credentials Modal for node operator approvals
  const [credentialsModal, setCredentialsModal] = useState<{
    show: boolean;
    userId: string;
    email: string;
    password: string;
  } | null>(null);

  // Fetch Current Profile
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const prof = await getOrCreateUserProfile(user.uid, user.email || "");
          setCurrentUserProfile(prof);
        } catch (err) {
          console.error(err);
        }
      }
    });
    return unsubscribe;
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
      console.error(err);
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
      console.error(err);
      setLoadingBuilder(false);
    });
    return unsubscribe;
  }, []);

  // Sync Node Requests
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "node_requests"), (snapshot) => {
      const list: NodeRequest[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as NodeRequest);
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      setNodeRequests(list);
      setLoadingNodes(false);
    }, (err) => {
      console.error(err);
      setLoadingNodes(false);
    });
    return unsubscribe;
  }, []);

  // Sync Research Proposals
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "research_proposals"), (snapshot) => {
      const list: ResearchProposal[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ResearchProposal);
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      setResearchProposals(list);
      setLoadingResearch(false);
    }, (err) => {
      console.error(err);
      setLoadingResearch(false);
    });
    return unsubscribe;
  }, []);

  // 1. Content Edits Actions
  const handleApproveContent = async (change: PendingChange) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "reviewer")) {
      alert("Permission Denied. Reviewer permissions required.");
      return;
    }

    if (confirm(`Approve and publish changes submitted by ${change.updatedBy}?`)) {
      try {
        if (change.type === "general") {
          saveGeneralContent(change.proposedContent);
        } else if (change.type === "cards") {
          saveCardContent(change.proposedContent);
        }

        await deleteDoc(doc(db, "pending_changes", change.id));
        alert("Changes approved and published to production!");
        await logActivity("APPROVE_CHANGES", `Approved pending content submitted by ${change.updatedBy}`);
        await addNotification("CHANGES_APPROVED", `Content modifications published by ${currentUserProfile.email}`);
      } catch (err: any) {
        alert("Failed to approve changes: " + err.message);
      }
    }
  };

  const handleRejectContent = async (change: PendingChange) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "reviewer")) {
      alert("Permission Denied. Reviewer permissions required.");
      return;
    }

    if (confirm(`Reject changes submitted by ${change.updatedBy}?`)) {
      try {
        await deleteDoc(doc(db, "pending_changes", change.id));
        alert("Proposed modifications rejected.");
        await logActivity("REJECT_CHANGES", `Rejected content edits by ${change.updatedBy}`);
      } catch (err: any) {
        alert("Failed to reject changes: " + err.message);
      }
    }
  };

  // 2. Homepage Builder Actions
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const list = [...homeSections];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    setHomeSections(list);
  };

  const handleMoveDown = (index: number) => {
    if (index === homeSections.length - 1) return;
    const list = [...homeSections];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    setHomeSections(list);
  };

  const handleToggleVisibility = (index: number) => {
    const list = [...homeSections];
    list[index] = { ...list[index], visible: !list[index].visible };
    setHomeSections(list);
  };

  const handleSaveLayout = async () => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "editor")) {
      alert("Permission Denied.");
      return;
    }

    try {
      const docRef = doc(db, "website_pages", "home");
      await setDoc(docRef, { sections: homeSections });
      alert("Website homepage layout configuration updated!");
      await logActivity("UPDATE_HOMEPAGE_LAYOUT", "Modified order or visibility of homepage sections.");
    } catch (err: any) {
      alert("Failed to save layout: " + err.message);
    }
  };

  // 3. Node Operator Actions
  const handleApproveNode = async (req: NodeRequest) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "admin")) {
      alert("Admin permissions required.");
      return;
    }

    try {
      if (req.type === "node_registration") {
        const id = `node-${Date.now()}`;
        await setDoc(doc(db, "nodes", id), {
          id,
          name: req.name,
          country: req.country,
          latitude: Math.floor(Math.random() * 100) + 40,
          longitude: Math.floor(Math.random() * 400) + 150,
          latency: Math.floor(Math.random() * 50) + 20,
          status: "online",
          capabilities: req.gpuSpecs || "General Compute",
          lastHeartbeat: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          ownerId: req.userId || "",
        });

        await updateDoc(doc(db, "node_requests", req.id), { status: "approved" });
        await logActivity("APPROVE_NODE_REGISTRATION", `Approved node "${req.name}"`);
        alert(`Successfully approved node: ${req.name}`);
        return;
      }

      const generatedUserId = generateUniqueUserId(req.name);
      const generatedPassword = generateRandomPassword();
      const hashedPass = await hashSHA256(generatedPassword);

      await setDoc(doc(db, "users", generatedUserId), {
        uid: generatedUserId,
        userId: generatedUserId,
        email: req.email,
        password: hashedPass,
        role: "node_operator",
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: "Never logged in",
        requestId: req.id,
      });

      await updateDoc(doc(db, "node_requests", req.id), {
        status: "approved",
        approvedUserId: generatedUserId,
        approvedPassword: generatedPassword,
      });

      await logActivity("APPROVE_APPLICATION", `Approved operator application for ${req.email}`);
      
      setCredentialsModal({
        show: true,
        userId: generatedUserId,
        email: req.email,
        password: generatedPassword,
      });
    } catch (err: any) {
      alert("Failed to approve application: " + err.message);
    }
  };

  const handleRejectNode = async (req: NodeRequest) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "admin")) {
      alert("Admin permissions required.");
      return;
    }
    if (confirm(`Reject node operator application for ${req.email}?`)) {
      try {
        await updateDoc(doc(db, "node_requests", req.id), { status: "rejected" });
        await logActivity("REJECT_APPLICATION", `Rejected node operator application for ${req.email}`);
      } catch (err: any) {
        alert("Failed to reject application: " + err.message);
      }
    }
  };

  const handleQuarantineNode = async (req: NodeRequest) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "admin")) {
      alert("Admin permissions required.");
      return;
    }
    if (confirm(`Quarantine node operator application for ${req.email}?`)) {
      try {
        await updateDoc(doc(db, "node_requests", req.id), { status: "quarantined" });
        await logActivity("QUARANTINE_APPLICATION", `Quarantined application for ${req.email}`);
      } catch (err: any) {
        alert("Failed to quarantine: " + err.message);
      }
    }
  };

  // 4. Research Proposal Actions
  const handleApproveProposal = async (prop: ResearchProposal) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "research_manager")) {
      alert("Research Manager permissions required.");
      return;
    }

    try {
      const cleanSlug = prop.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const paperId = `paper-${Date.now()}`;

      await setDoc(doc(db, "research", paperId), {
        id: paperId,
        title: prop.title,
        slug: cleanSlug,
        category: "Core Engine",
        abstract: prop.abstract,
        authors: prop.authors,
        date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        pdfUrl: prop.pdfUrl,
        tags: prop.tags,
        timestamp: Date.now()
      });

      const uiRequestId = `ui-${Date.now()}`;
      await setDoc(doc(db, "ui_requests", uiRequestId), {
        id: uiRequestId,
        proposalId: prop.id,
        title: prop.title,
        abstract: prop.abstract,
        authors: prop.authors,
        requestedBy: currentUserProfile.email,
        status: "Pending",
        timestamp: Date.now()
      });

      await updateDoc(doc(db, "research_proposals", prop.id), { status: "Approved" });
      await logActivity("APPROVE_RESEARCH_PROPOSAL", `Approved scientific paper: "${prop.title}"`);
      await addNotification("RESEARCH", `Approved proposal: "${prop.title}"`);
      alert("Proposal approved! Published to public index and queued builder request.");
    } catch (err: any) {
      alert("Failed to approve proposal: " + err.message);
    }
  };

  const handleRejectProposal = async (prop: ResearchProposal) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "research_manager")) {
      alert("Research Manager permissions required.");
      return;
    }
    if (confirm(`Reject scientific proposal: "${prop.title}"?`)) {
      try {
        await updateDoc(doc(db, "research_proposals", prop.id), { status: "Rejected" });
        await logActivity("REJECT_RESEARCH_PROPOSAL", `Rejected scientific proposal "${prop.title}"`);
      } catch (err: any) {
        alert("Failed to reject proposal: " + err.message);
      }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-6 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl">Approvals command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Unified routing portal to audit content changes, layout structures, node registries, and research publications.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "content" ? "bg-[#4D7CFE] text-white shadow-[0_0_15px_rgba(77,124,254,0.3)]" : "text-gray-400 hover:text-white"
            }`}
          >
            <ClipboardCheck className="w-4 h-4" /> Content Edits ({pendingChanges.filter(c => c.id).length})
          </button>
          <button
            onClick={() => setActiveTab("builder")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "builder" ? "bg-[#4D7CFE] text-white shadow-[0_0_15px_rgba(77,124,254,0.3)]" : "text-gray-400 hover:text-white"
            }`}
          >
            <Layout className="w-4 h-4" /> Homepage Builder
          </button>
          <button
            onClick={() => setActiveTab("nodes")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "nodes" ? "bg-[#4D7CFE] text-white shadow-[0_0_15px_rgba(77,124,254,0.3)]" : "text-gray-400 hover:text-white"
            }`}
          >
            <Server className="w-4 h-4" /> Node Operators ({nodeRequests.filter(r => r.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("research")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "research" ? "bg-[#4D7CFE] text-white shadow-[0_0_15px_rgba(77,124,254,0.3)]" : "text-gray-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Research Papers ({researchProposals.filter(p => p.status === "Pending").length})
          </button>
        </div>
      </header>

      {/* 1. Content Edits Tab */}
      {activeTab === "content" && (
        <div className="flex flex-col gap-6">
          {loadingChanges ? (
            <div className="py-12 text-center text-xs text-gray-500 animate-pulse font-mono">Syncing content updates...</div>
          ) : pendingChanges.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <Check className="w-12 h-12 text-emerald-500/80 bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20" />
              <p className="text-sm text-gray-500 mt-2">All content modifications resolved. Production registry matches editor.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {pendingChanges.map((change) => (
                <div key={change.id} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                        {change.type === "general" ? "General Sections" : "Card Collections"}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">{new Date(change.timestamp).toLocaleString()}</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm">
                      Proposed layout revisions submitted by <strong className="text-white">{change.updatedBy}</strong>
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleRejectContent(change)}
                      className="flex items-center gap-1.5 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 text-xs font-semibold px-4 py-2.5 rounded-lg text-red-400 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" /> Reject Edits
                    </button>
                    <button
                      onClick={() => handleApproveContent(change)}
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

      {/* 2. Homepage Builder Tab */}
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
            <div className="py-12 text-center text-xs text-gray-500 animate-pulse font-mono">Syncing builder layout...</div>
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
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-2 rounded border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === homeSections.length - 1}
                      className="p-2 rounded border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
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

      {/* 3. Node Operators Tab */}
      {activeTab === "nodes" && (
        <div className="flex flex-col gap-6">
          {loadingNodes ? (
            <div className="py-12 text-center text-xs text-gray-500 animate-pulse font-mono">Syncing operators applications...</div>
          ) : nodeRequests.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <Check className="w-12 h-12 text-emerald-500/80 bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20" />
              <p className="text-sm text-gray-500 mt-2">All node operator applications cleared.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Specs/Institution</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {nodeRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4">
                        <span className="block font-semibold text-white">{req.name}</span>
                        <span className="block text-xs text-gray-500 font-mono mt-0.5">{req.email}</span>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono">
                        {req.type === "node_registration" ? (
                          <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold uppercase">Node Reg</span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase">{req.role}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {req.type === "node_registration" ? (req.gpuSpecs || "General GPU") : (req.institution || "Independent")}
                      </td>
                      <td className="py-4 px-4 text-gray-400">{req.country || "N/A"}</td>
                      <td className="py-4 px-4 text-gray-500 font-mono text-xs">{req.date}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                          req.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          req.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          req.status === "quarantined" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}>
                          {req.status || "PENDING"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {(!req.status || req.status === "pending") && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleQuarantineNode(req)}
                              className="text-xs text-amber-400 hover:text-amber-300 font-bold px-2.5 py-1.5 border border-amber-500/10 hover:border-amber-500/30 rounded bg-amber-500/5 transition-colors cursor-pointer"
                            >
                              Quarantine
                            </button>
                            <button
                              onClick={() => handleRejectNode(req)}
                              className="text-xs text-red-400 hover:text-red-300 font-bold px-2.5 py-1.5 border border-red-500/10 hover:border-red-500/30 rounded bg-red-500/5 transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveNode(req)}
                              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-3 py-1.5 rounded transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Research Papers Tab */}
      {activeTab === "research" && (
        <div className="flex flex-col gap-6">
          {loadingResearch ? (
            <div className="py-12 text-center text-xs text-gray-500 animate-pulse font-mono">Syncing scientific proposals...</div>
          ) : researchProposals.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <Check className="w-12 h-12 text-emerald-500/80 bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20" />
              <p className="text-sm text-gray-500 mt-2">All scientific proposals resolved.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {researchProposals.map((prop) => (
                <div key={prop.id} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm font-heading">{prop.title}</strong>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                          prop.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          prop.status === "Rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}>
                          {prop.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold mt-1">Authors: {prop.authors}</span>
                    </div>

                    {prop.status === "Pending" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRejectProposal(prop)}
                          className="flex items-center gap-1.5 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 text-xs font-semibold px-3 py-2 rounded-lg text-red-400 cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveProposal(prop)}
                          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                        >
                          Approve & Publish
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-light">{prop.abstract}</p>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3 text-[9px] text-gray-500 font-mono">
                    <span>Submitted by: {prop.submittedBy}</span>
                    <span>{new Date(prop.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Credentials Modal (reused from admin/page.tsx dashboard) */}
      {credentialsModal && credentialsModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-8 border border-white/10 bg-[#030712] flex flex-col gap-5 text-center">
            <Check className="w-12 h-12 text-emerald-400 bg-emerald-500/10 p-2.5 rounded-full border border-emerald-500/20 mx-auto" />
            
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">Operator Authorized</h3>
              <p className="text-xs text-gray-400 mt-2">
                A secure login profile has been successfully generated for the operator:
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2.5 text-left font-mono text-xs text-gray-300 select-all">
              <div>Email: <strong className="text-white">{credentialsModal.email}</strong></div>
              <div>User ID: <strong className="text-white">{credentialsModal.userId}</strong></div>
              <div>Password: <strong className="text-white">{credentialsModal.password}</strong></div>
            </div>

            <p className="text-[10px] text-orange-400 font-semibold leading-normal">
              WARNING: Copy these details. The password is cryptographically hashed and cannot be retrieved again.
            </p>

            <button
              onClick={() => setCredentialsModal(null)}
              className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 text-xs font-bold text-white transition-all cursor-pointer mt-2"
            >
              Close parameters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
