export interface SearchItem {
  title: string;
  category: "Agent" | "Sector" | "Technology" | "Research" | "Revenue Model" | "Manifesto" | "Roadmap" | "Architecture" | "Quote" | "Action";
  description: string;
  targetId: string;
  command: string;
}

export const SEARCH_INDEX: SearchItem[] = [
  // Actions / General navigation
  {
    title: "Jump to Architecture",
    category: "Action",
    description: "Navigate to the Core Architecture technical diagram section.",
    targetId: "#architecture",
    command: "Jump to Architecture"
  },
  {
    title: "Jump to Research",
    category: "Action",
    description: "Navigate to research papers and federated intelligence documents.",
    targetId: "#research",
    command: "Jump to Research"
  },
  {
    title: "Jump to Manifesto",
    category: "Action",
    description: "Read the AEGIS network digital manifesto.",
    targetId: "#manifesto",
    command: "Jump to Manifesto"
  },
  {
    title: "Explore Sectors",
    category: "Action",
    description: "View all industrial applications powered by AEGIS nodes.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Join Network",
    category: "Action",
    description: "Open the compute node registration application form.",
    targetId: "#join",
    command: "Join Network"
  },
  {
    title: "View Technology Stack",
    category: "Action",
    description: "Inspect the cryptographic layers and AI technologies.",
    targetId: "#technology",
    command: "View Technology Stack"
  },
  {
    title: "Open Agent Ecosystem",
    category: "Action",
    description: "Explore autonomous specialized cognitive agents.",
    targetId: "#agents",
    command: "Open Agent Ecosystem"
  },

  // Architecture Layers
  {
    title: "Local Agents Layer",
    category: "Architecture",
    description: "Specialized models interacting inside local network nodes.",
    targetId: "#architecture",
    command: "Jump to Architecture"
  },
  {
    title: "Compute Nodes",
    category: "Architecture",
    description: "Secure, homomorphic compute clusters validating transaction state.",
    targetId: "#architecture",
    command: "Jump to Architecture"
  },
  {
    title: "Coordination Aggregators",
    category: "Architecture",
    description: "Gradient averaging networks running homomorphic secure enclaves.",
    targetId: "#architecture",
    command: "Jump to Architecture"
  },
  {
    title: "AEGIS Core Ledger",
    category: "Architecture",
    description: "Distributed consensus ledger storing cryptographic coordinate proofs.",
    targetId: "#architecture",
    command: "Jump to Architecture"
  },

  // Agent Ecosystem
  {
    title: "Aegis Doctor Agent",
    category: "Agent",
    description: "Private diagnostic and clinical medicine agent running at local hospital nodes.",
    targetId: "#agents",
    command: "Open Agent Ecosystem"
  },
  {
    title: "Aegis Actuary Agent",
    category: "Agent",
    description: "Risk assessment model calculating policy indicators for insurance networks.",
    targetId: "#agents",
    command: "Open Agent Ecosystem"
  },
  {
    title: "Aegis Analyst Agent",
    category: "Agent",
    description: "Quantitative analytics agent modeling capital flow patterns for banking nodes.",
    targetId: "#agents",
    command: "Open Agent Ecosystem"
  },
  {
    title: "Aegis Botanist Agent",
    category: "Agent",
    description: "Agricultural optimization model adapting crop forecasts using sensor telemetry.",
    targetId: "#agents",
    command: "Open Agent Ecosystem"
  },

  // Sectors
  {
    title: "Healthcare Sector Node",
    category: "Sector",
    description: "Privacy-preserving model fine-tuning for diagnostic intelligence.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Banking Sector Node",
    category: "Sector",
    description: "Real-time outlier network alerts detecting transaction capital fraud.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Agriculture Sector Node",
    category: "Sector",
    description: "Localized soil & weather sensor models computing localized yields.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Education Sector Node",
    category: "Sector",
    description: "Dynamic personalized student models adapting learning curricula.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Research Sector Node",
    category: "Sector",
    description: "Automated simulation synthesis and academic cluster validation.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Insurance Sector Node",
    category: "Sector",
    description: "Dynamic actuarial model assessment and smart-contract verified audits.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Manufacturing Sector Node",
    category: "Sector",
    description: "Predictive asset lifecycle tracking and industrial telemetry analysis.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Retail Sector Node",
    category: "Sector",
    description: "Dynamic predictive ordering pipelines and distribution optimization.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Energy Sector Node",
    category: "Sector",
    description: "Smart grid flow load prediction and consumption telemetry parameters.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Transportation Sector Node",
    category: "Sector",
    description: "Federated coordinate navigation and real-time vehicle traffic routing.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Telecom Sector Node",
    category: "Sector",
    description: "Dynamic cell tower router allocations and municipal network load balancing.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Environment Sector Node",
    category: "Sector",
    description: "Decentralized forest fire warnings using localized sensor telemetry processing.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Government Sector Node",
    category: "Sector",
    description: "Automated secure administrative filing and document sorting pipelines.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Legal Sector Node",
    category: "Sector",
    description: "Fast precedent search matching and semantic document review embeddings.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Media Sector Node",
    category: "Sector",
    description: "Deep semantic interest vectoring for high-context content recommendations.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "HR Sector Node",
    category: "Sector",
    description: "Automated candidate resume parsing, qualification validation, and ranking.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Real Estate Sector Node",
    category: "Sector",
    description: "Predictive yield modeling indices and node coordinate verification.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Supply Chain Sector Node",
    category: "Sector",
    description: "Consensus cargo routing vectors and port logistics queue optimization.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },
  {
    title: "Pharmaceuticals Sector Node",
    category: "Sector",
    description: "Accelerated molecular discovery timelines using chemical screening enclaves.",
    targetId: "#sectors",
    command: "Explore Sectors"
  },

  // Tech Stack
  {
    title: "Multi-Agent Systems",
    category: "Technology",
    description: "Collaborative, autonomous AI units executing complex multi-step reasoning cycles.",
    targetId: "#technology",
    command: "View Technology Stack"
  },
  {
    title: "Retrieval-Augmented Generation (RAG)",
    category: "Technology",
    description: "Retrieval engines linking reasoning modules with secure private context vectors.",
    targetId: "#technology",
    command: "View Technology Stack"
  },
  {
    title: "Federated Learning",
    category: "Technology",
    description: "Privacy-preserving collaborative training that compiles model updates locally.",
    targetId: "#technology",
    command: "View Technology Stack"
  },
  {
    title: "Selective LoRA Adaptation",
    category: "Technology",
    description: "Weight adaptation targeting specific transformer layers, minimizing overhead.",
    targetId: "#technology",
    command: "View Technology Stack"
  },

  // Revenue Models
  {
    title: "Subscription Model",
    category: "Revenue Model",
    description: "Flat rate plans for nodes accessing global consensus weights.",
    targetId: "#economics",
    command: "View Revenue Model"
  },
  {
    title: "Agent Lease Model",
    category: "Revenue Model",
    description: "Lease domain-specific agents (Doctor, Legal, Banking) locally.",
    targetId: "#economics",
    command: "View Revenue Model"
  },
  {
    title: "Consensus API Access",
    category: "Revenue Model",
    description: "Secure gateway endpoints for external applications querying models.",
    targetId: "#economics",
    command: "View Revenue Model"
  },

  // Research
  {
    title: "Zero-Knowledge Aggregator Proofs",
    category: "Research",
    description: "Cryptographic validation verifying gradient updates without weight leaks.",
    targetId: "#research",
    command: "Jump to Research"
  },
  {
    title: "Homomorphic Consensus Engine",
    category: "Research",
    description: "Computing global average weights securely inside encrypted state buffers.",
    targetId: "#research",
    command: "Jump to Research"
  },

  // Manifesto & Quotes
  {
    title: "The Aegis Manifesto",
    category: "Manifesto",
    description: "The core statements outlining our mission for connected intelligence infrastructure.",
    targetId: "#manifesto",
    command: "Jump to Manifesto"
  },
  {
    title: "The Next Infrastructure Is Intelligence",
    category: "Quote",
    description: "Core quote bridging the Hero and Vision sections.",
    targetId: "#vision",
    command: "Jump to Vision"
  }
];
