"use client";

import { useEffect, useState } from "react";

export interface GeneralContent {
  navbar: {
    logoText: string;
    ctaText: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    exploreBtnText: string;
    joinBtnText: string;
    cognitiveBridgeQuote: string;
  };
  ageOfIntelligence: {
    badge: string;
    description: string;
    leftBadge: string;
    leftTitle: string;
    paragraphs: string;
    metrics: { value: string; label: string }[];
    blocks: { title: string; desc: string }[];
  };
  vision: {
    badge: string;
    title: string;
    cards: { title: string; text: string }[];
    highlight: string;
    ctaText: string;
  };
  problem: {
    badge: string;
    title: string;
    description: string;
    requirements: { name: string; desc: string }[];
    quote: string;
    ctaText: string;
  };
  coreArchitecture: {
    badge: string;
    title: string;
    description: string;
    statement: string;
    steps: { title: string; desc: string }[];
    ctaText: string;
  };
  research: {
    badge: string;
    title: string;
    description: string;
    documents: { title: string; filename: string; type: string; size: string; date: string }[];
    ctaText: string;
  };
  roadmap: {
    badge: string;
    title: string;
    description: string;
    steps: { year: string; title: string; desc: string }[];
    ctaText: string;
  };
  joinNetwork: {
    badge: string;
    title: string;
    description: string;
    submitText: string;
    successTitle: string;
    successDesc: string;
  };
  manifesto: {
    badge: string;
    statements: string[];
  };
  sectors: {
    badge: string;
    title: string;
    description: string;
  };
  economics: {
    badge: string;
    title: string;
    description: string;
  };
  technology: {
    badge: string;
    title: string;
    description: string;
  };
  agents: {
    badge: string;
    title: string;
    description: string;
  };
  footer: {
    logoText: string;
    subtitle: string;
    description: string;
    copyrightText: string;
  };
  blogEssay: {
    title: string;
    subtitle: string;
    author: string;
    date: string;
    readTime: string;
    paragraphs: string;
  };
}

export const defaultGeneralContent: GeneralContent = {
  navbar: {
    logoText: "AEGIS",
    ctaText: "JOIN NETWORK",
  },
  hero: {
    title: "AEGIS",
    subtitle: "INTELLIGENCE INFRASTRUCTURE",
    description: "Building Intelligence Through Connection",
    exploreBtnText: "EXPLORE THE VISION",
    joinBtnText: "JOIN THE NETWORK",
    cognitiveBridgeQuote: "The Next Infrastructure Is Intelligence",
  },
  ageOfIntelligence: {
    badge: "THE AGE OF INTELLIGENCE",
    description: "Human civilization is entering an era where intelligence itself becomes infrastructure.",
    leftBadge: "THE AGE OF INTELLIGENCE",
    leftTitle: "Intelligence Is Becoming\nA Fundamental Layer\nOf Civilization",
    paragraphs: "Electricity transformed industry.\n\nThe internet transformed communication.\n\nArtificial intelligence transforms decision-making.\n\nThe next infrastructure is not roads, cables, or data centers alone. It is intelligence itself.\n\nEvery organization, institution, and individual is becoming part of an emerging intelligence network.",
    metrics: [
      { value: "100B+", label: "Connected Devices" },
      { value: "1T+", label: "Daily Decisions" },
      { value: "Infinite", label: "Knowledge Sources" },
      { value: "24/7", label: "Distributed Intelligence" }
    ],
    blocks: [
      { title: "INTELLIGENCE", desc: "Machines reason. Humans collaborate. Knowledge compounds." },
      { title: "CONNECTION", desc: "Networks matter more than isolated systems." },
      { title: "COORDINATION", desc: "The future belongs to systems capable of organizing intelligence." }
    ]
  },
  vision: {
    badge: "THE AEGIS ARCHETYPE",
    title: "A Decentralized\nIntelligence Network.",
    cards: [
      { title: "Problem", text: "Centralized AI concentrates power and compute control inside a few monopolistic gatekeepers." },
      { title: "Paradox", text: "Scaling central nodes makes models incredibly powerful but fragile, biased, and inaccessible locally." },
      { title: "Vision", text: "A cooperative public intelligence resource owned and operated by the global communities that use it." },
      { title: "Mission", text: "Build the secure coordination software layer that connects local nodes into a unified brain." }
    ],
    highlight: "Collective intelligence emerges.",
    ctaText: "LEARN MORE ABOUT COLLECTIVE EMERGENCE"
  },
  problem: {
    badge: "THE CURRENT STATE",
    title: "Intelligence Production\nIs Concentrated.",
    description: "Advanced AI systems require massive clusters, creating single points of failure and monopolistic gatekeeping. The infrastructure to produce next-gen intelligence demands:",
    requirements: [
      { name: "Compute", desc: "Tens of thousands of specialized accelerators clustered in hyperscale facilities." },
      { name: "Capital", desc: "Billions of dollars required upfront to build and sustain operations." },
      { name: "Energy", desc: "Gigawatts of power drawing directly from critical grids." },
      { name: "Talent", desc: "Concentration of specialized system engineers and researchers." },
      { name: "Data", desc: "Aggregated global datasets siloed inside private network clouds." }
    ],
    quote: "The challenge is not intelligence. The challenge is infrastructure.",
    ctaText: "LEARN MORE ABOUT INFRASTRUCTURE CONSTRAINTS"
  },
  coreArchitecture: {
    badge: "THE STACK",
    title: "Core Architecture",
    description: "The flow of intelligence through AEGIS: local requests remain local, weights compile cryptographically, and collective knowledge is distributed back to nodes.",
    statement: "No raw data moves.\nOnly intelligence moves.",
    steps: [
      { title: "Agents", desc: "Orchestrate local reasoning flows, tool usage, and custom sub-agents." },
      { title: "Nodes", desc: "Compute locally using proprietary, secure data sources and local GPUs." },
      { title: "Aggregators", desc: "Compile zero-knowledge mathematical updates and models dynamically." },
      { title: "AEGIS Core", desc: "The global coordination consensus that updates network layers." }
    ],
    ctaText: "LEARN MORE ABOUT THE DATA PROTOCOL"
  },
  research: {
    badge: "RESOURCE REPOSITORY",
    title: "Research & Documentation",
    description: "Read our scientific foundation papers, technical blueprints, architecture document specs, and essays.",
    documents: [
      { title: "Whitepapers", filename: "AEGIS_Vision_Whitepaper.pdf", type: "Consensus Paper", size: "4.2 MB", date: "Jan 2026" },
      { title: "Technical Papers", filename: "Federated_LoRA_Aggregation.pdf", type: "Core Technology", size: "8.5 MB", date: "Mar 2026" },
      { title: "Architecture Documents", filename: "Node_System_Specifications.pdf", type: "System Specs", size: "12.1 MB", date: "Apr 2026" },
      { title: "Presentations", filename: "AEGIS_Deck_2026.pdf", type: "Intro Slides", size: "15.4 MB", date: "May 2026" },
      { title: "Blogs", filename: "Why_Local_Nodes_Beat_Hyperscalers.md", type: "Network Essay", size: "120 KB", date: "Jun 2026" }
    ],
    ctaText: "BROWSE COMPLETE REPOSITORY"
  },
  roadmap: {
    badge: "THE PLAN",
    title: "AEGIS Roadmap",
    description: "From prototype builds to a globally coordinated collective intelligence backbone.",
    steps: [
      { year: "Phase 1-3 (2025)", title: "Core Platform", desc: "Release of the AEGIS microkernel runtime, local memory gateway, Named Pipe IPC, and native C++ base daemon (Completed)." },
      { year: "Phase 4-7 (2026)", title: "Distributed Swarm", desc: "Deployment of STUN NAT traversal overlay, Noise_IK tunnels, and Swarm FedAvg weight aggregates (Completed)." },
      { year: "Phase 8-10 (Active)", title: "Autonomous Agent Flow", desc: "Autonomous multi-agent planning enclaves, sandbox tool permissions, and memory projection engines." },
      { year: "Phase 11 (2027)", title: "Hardware Synthesis", desc: "Native NPU/TPU hardware acceleration bindings and zero-copy intra-node IPC transport namespaces." },
      { year: "Phase 12 (2028)", title: "Unified Intelligence", desc: "Federated coordination consensus across edge networks and automatic model checkpoint validation." },
      { year: "Phase 13 (2029)", title: "SDK & ASCI Integration", desc: "Cross-language interfaces for Flutter, Python, and C++ nodes complying with state audit consensus rules." }
    ],
    ctaText: "LEARN MORE ABOUT DEVELOPMENT PIPELINES"
  },
  joinNetwork: {
    badge: "PARTICIPATE",
    title: "Join The AEGIS Network",
    description: "Register your institution, spin up a secure compute node, or apply to join our core developer working groups.",
    submitText: "SUBMIT APPLICATION",
    successTitle: "Application Received",
    successDesc: "Thank you. Our coordination aggregators will review your node request and contact you soon.",
  },
  manifesto: {
    badge: "THE AEGIS MANIFESTO",
    statements: [
      "The future of AI may not belong only to giant data centers.",
      "It may belong to connected communities.",
      "Every institution becomes a node.",
      "Every contribution improves the network.",
      "Together they create something larger."
    ]
  },
  sectors: {
    badge: "APPLICATIONS",
    title: "Sectors Empowered By AEGIS",
    description: "Aegis provides specialized solutions tailored for global industries. Choose a sector category and select a card to explore deep-technical node structures."
  },
  economics: {
    badge: "ECONOMICS",
    title: "Network Revenue Models",
    description: "The decentralized intelligence network operates as a cooperative network. Inspect monetization vectors powering node operators."
  },
  technology: {
    badge: "CORE ENGINE",
    title: "Cryptographic Tech Stack",
    description: "The protocols, databases, and AI technologies powering the decentralized intelligence grid."
  },
  agents: {
    badge: "DECENTRALIZED COGNITION",
    title: "Agent Ecosystem",
    description: "Specialized autonomous intelligence nodes operating collaboratively within the AEGIS framework."
  },
  footer: {
    logoText: "AEGIS",
    subtitle: "INTELLIGENCE INFRASTRUCTURE",
    description: "Building Intelligence Through Connection. Supporting a global, distributed collective intelligence paradigm.",
    copyrightText: "AEGIS PROTOCOL. ALL RIGHTS RESERVED. INVENTED BY CONNECTED COMMUNITIES."
  },
  blogEssay: {
    title: "Demystifying AEGIS: The Sovereign, Privacy-First Collective Intelligence Network",
    subtitle: "How decentralized runtime kernels, localized vector graphs, and swarm learning topology unify independent node clusters without data exposure.",
    author: "AEGIS AI Foundation",
    date: "June 2026",
    readTime: "8 min read",
    paragraphs: "In an era dominated by centralized artificial intelligence giants, a critical question looms: Can we build a global collective intelligence without sacrificing local sovereignty, data ownership, and individual privacy?\n\nThe answer is AEGIS.\n\nAEGIS (Advanced Engine for General Intelligence and Sovereignty) represents a paradigm shift in how AI models are executed, optimized, and connected. It is a production-grade, decentralized platform designed to keep raw data firmly under the user's control while enabling sovereign nodes to securely collaborate, learn, and grow together.\n\nCentralized cloud AI has structural limitations that are increasingly hitting walls: privacy violations where models require uploading raw user databases, high API subscription costs, latency, and single points of control/failure. AEGIS resolves these by moving execution local, scrubbing PII, and using federated learning to aggregate math updates (gradients/deltas) instead of data files."
  }
};

const storageKey = "aegis_general_content";

export function readGeneralContent(): GeneralContent {
  if (typeof window === "undefined") return defaultGeneralContent;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    return saved ? { ...defaultGeneralContent, ...saved } : defaultGeneralContent;
  } catch {
    return defaultGeneralContent;
  }
}

import { db, auth } from "./firebase";
import { doc, onSnapshot, setDoc, getDoc, collection } from "firebase/firestore";

export async function saveGeneralContent(content: GeneralContent) {
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(content));
    window.dispatchEvent(new Event("aegis-general-content-changed"));
  }
  try {
    const docRef = doc(db, "website_data", "general");
    
    // Version History backup
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const backupRef = doc(collection(db, "website_versions"));
      await setDoc(backupRef, {
        type: "general",
        content: snap.data(),
        updatedBy: auth.currentUser?.email || "admin",
        updatedAt: new Date().toISOString(),
        timestamp: Date.now(),
      });
    }

    await setDoc(docRef, content);
  } catch (err) {
    console.error("Firestore general content save and backup failed:", err);
  }
}

export function useGeneralContent() {
  const [content, setContent] = useState<GeneralContent>(() => readGeneralContent());

  useEffect(() => {
    const sync = () => setContent(readGeneralContent());
    window.addEventListener("aegis-general-content-changed", sync);

    let unsubscribe = () => {};
    try {
      const docRef = doc(db, "website_data", "general");
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as GeneralContent;
          setContent(data);
          if (typeof window !== "undefined") {
            localStorage.setItem(storageKey, JSON.stringify(data));
          }
        } else {
          setDoc(docRef, defaultGeneralContent).catch(console.error);
        }
      }, (err) => {
        console.warn("Firestore general content listener warning:", err);
      });
    } catch (err) {
      console.error("Firestore hook listener creation failed:", err);
    }

    return () => {
      window.removeEventListener("aegis-general-content-changed", sync);
      unsubscribe();
    };
  }, []);

  return content;
}
