import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWXQDhgvhbhRK5OsKcVAVtY6Q5abtAc_A",
  authDomain: "aegis-b071c.firebaseapp.com",
  projectId: "aegis-b071c",
  storageBucket: "aegis-b071c.firebasestorage.app",
  messagingSenderId: "139684986381",
  appId: "1:139684986381:web:dd3839ffc0d1dd3e62df44",
  measurementId: "G-RXVSF1ZERG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Data definition
const defaultGeneralContent = {
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

const defaultCardContent = {
  technology: [
    { id: "multi-agent-systems", title: "Multi-Agent Systems", desc: "Collaborative, autonomous AI units executing complex multi-step reasoning cycles.", spec: "Dynamic task delegation" },
    { id: "rag", title: "RAG", desc: "Retrieval-Augmented Generation linking reasoning engines with secure context sources.", spec: "Semantic document vector indexing" },
    { id: "vector-databases", title: "Vector Databases", desc: "High-performance vector space engines optimized for semantic similarity queries.", spec: "Sub-millisecond retrieval speeds" },
    { id: "knowledge-graphs", title: "Knowledge Graphs", desc: "Structured conceptual node maps connecting facts, relationships, and context.", spec: "Triple-store factual indexing" },
    { id: "federated-learning", title: "Federated Learning", desc: "Privacy-preserving collaborative training that compiles model updates locally.", spec: "Zero-Knowledge model adjustments" },
    { id: "selective-lora", title: "Selective LoRA", desc: "Weight adaptation targeting specific transformer layers, minimizing overhead.", spec: "Parameter-efficient tuning" },
    { id: "secure-aggregation", title: "Secure Aggregation", desc: "Cryptographic consensus blending model gradients without weight exposure.", spec: "Homomorphic encryption layers" },
    { id: "trust-engine", title: "Trust Engine", desc: "Adversarial shield analyzing queries and outputs for safety compliance.", spec: "Real-time prompt protection" },
    { id: "blockchain-layer", title: "Blockchain Layer", desc: "Immutable distributed ledger verifying and logging node compute histories.", spec: "Smart-contract verified audits" },
  ],
  revenue: [
    { id: "subscriptions", title: "Subscriptions", desc: "Flat rate plans for nodes accessing global consensus weights." },
    { id: "agent-as-a-service", title: "Agent as a Service", desc: "Lease domain-specific agents (Doctor, Legal, Banking) locally." },
    { id: "api-access", title: "API Access", desc: "Secure gateway endpoints for external applications querying models." },
    { id: "white-label", title: "White Label", desc: "Deploy custom partitioned networks for private enterprises." },
    { id: "marketplace", title: "Marketplace", desc: "Trade specialized LoRA adapters and custom knowledge graphs." },
    { id: "research-access", title: "Research Access", desc: "Subsidized subscriptions for academic and non-profit centers." },
    { id: "government-contracts", title: "Government Contracts", desc: "Custom federal secure-node clusters and analytics layers." },
    { id: "certification", title: "Certification", desc: "Audit and verify third-party agent safety compliance states." },
    { id: "premium-intelligence", title: "Premium Intelligence", desc: "Access high-compute fine-tuned reasoning blocks." },
  ],
  agents: [
    { id: "research-agent", title: "Research Agent", class: "AEGIS-RES-01", desc: "Accelerates scientific discoveries, catalogs academic literature, and validates experimental models across medical and environmental nodes.", inputs: "Scientific Journals, Raw Experiment Telemetry, Molecular Simulation Indices, Adaptation Datasets", consensus: "Runs federated parameter aggregation models and verifies validation accuracy via Zero-Knowledge consensus channels.", coordination: "Doctor Agent, Agriculture Agent", kpis: "Adaptation Accuracy|99.8%; Sync Latency|142 ms; Active Nodes|2,840" },
    { id: "doctor-agent", title: "Doctor Agent", class: "AEGIS-MED-02", desc: "Assists clinical diagnostics, parses healthcare records, and structures patient care pathways locally inside hospital boundary zones.", inputs: "Electronic Health Records, DICOM Imaging Metrics, Lab Telemetry Streams, Symptom Logs", consensus: "Executes de-identified token verification and Multi-Party Secure computations to generate diagnostic suggestions.", coordination: "Legal Agent, Research Agent", kpis: "Diagnostic Accuracy|99.4%; Symptom Parsing Delay|98 ms; Active Nodes|1,220" },
    { id: "education-agent", title: "Education Agent", class: "AEGIS-EDU-03", desc: "Personalizes learning curricula, structures academic databases, and generates interactive quizzes adapted to node performance indicators.", inputs: "Academic Textbooks, Student Performance Data, Curriculum Catalogs, Exam Results", consensus: "Validates decentralized Proof-of-Skill logs and anonymized student learning progress benchmarks.", coordination: "Government Agent", kpis: "Engagement Rating|4.8/5.0; Query Response Speed|65 ms; Active Nodes|4,110" },
    { id: "government-agent", title: "Government Agent", class: "AEGIS-GOV-04", desc: "Streamlines municipal filing procedures, indexes legislative databases, and audits public records with mathematical certainty.", inputs: "Municipal Filing Sheets, Public Land Registries, Legislative Policies, Identity Validation Tokens", consensus: "Ensures Zero-Disclosure document routing audits and validates state authority multi-signatures.", coordination: "Legal Agent, Education Agent", kpis: "Audit Integrity|100%; Filing Validation Speed|240 ms; Active Nodes|850" },
    { id: "agriculture-agent", title: "Agriculture Agent", class: "AEGIS-AGR-05", desc: "Analyzes crop yields, monitors localized sensor networks, and coordinates soil treatment adaptations in real time.", inputs: "Soil Sensor Telemetry, Satellite Weather Maps, Crop Yield Logs, Resource Budgets", consensus: "Proof-of-Authority consensus checking for regional resource distribution algorithms and weather prediction models.", coordination: "Research Agent", kpis: "Yield Improvement Index|+14.8%; Sync Telemetry Rate|1.2s; Active Nodes|920" },
    { id: "banking-agent", title: "Banking Agent", class: "AEGIS-FIN-06", desc: "Identifies transaction anomalies, checks credit histories, and audits institutional compliance policies on isolated nodes.", inputs: "Transaction Ledgers, Credit Score Histories, Market FX Price Lists, Compliance Regulations", consensus: "Resolves Zero-Knowledge financial transfers and handles multi-party encrypted ledger settlements.", coordination: "Legal Agent, Insurance Agent", kpis: "False Positive Ratio|0.0001%; Clearing Speed|110 ms; Active Nodes|1,940" },
    { id: "legal-agent", title: "Legal Agent", class: "AEGIS-LGL-07", desc: "Indexes statutory precedents, checks case citations, and highlights contract clauses to ensure compliance in coordinate events.", inputs: "Civil Statutes, Contract Drafts, Compliance Guidelines, Case Precedents", consensus: "Runs cryptographic clause parsing algorithms and audits Proof-of-Consent ledger signatures.", coordination: "Government Agent, Doctor Agent, Banking Agent", kpis: "Clause Parsing Accuracy|98.9%; Verification Latency|160 ms; Active Nodes|680" },
    { id: "manufacturing-agent", title: "Manufacturing Agent", class: "AEGIS-MFG-08", desc: "Predicts assembly machine breakdowns, monitors SCADA systems, and maps logistics lines for institutional factory nodes.", inputs: "Vibration Sensors, Temperature Logs, Vendor Shipments, Operational Logs", consensus: "Byzantine Fault Tolerant telemetry checks and coordinates multi-node product adaptation pipelines.", coordination: "Supply Chain Agent", kpis: "Downtime Prevention|+28.0%; Sensor Ping Delay|45 ms; Active Nodes|1,350" },
    { id: "insurance-agent", title: "Insurance Agent", class: "AEGIS-INS-09", desc: "Models actuarial risk factors, automates claim filing pipelines, and checks policy limits against coordination ledgers.", inputs: "Actuarial Probability Lists, Claim Documents, Policy Parameters, Property Logs", consensus: "Validates multi-party auto-claim approvals and checks Proof-of-Loss hashes in real time.", coordination: "Banking Agent", kpis: "Automated Payout Rate|92%; Policy Check Speed|180 ms; Active Nodes|1,140" },
    { id: "supply-chain-agent", title: "Supply Chain Agent", class: "AEGIS-SCM-10", desc: "Balances warehouse stocks, optimizes delivery routes, and tracks global vendor shipping metrics between enterprise nodes.", inputs: "Inventory Data, Vehicle GPS Feeds, Vendor Invoices, Shipping Ledgers", consensus: "Decentralized state verification for shipments and registers Proof-of-Delivery smart contracts.", coordination: "Manufacturing Agent", kpis: "Transit Time Savings|18.2%; Telemetry Update Sync|75 ms; Active Nodes|2,120" },
  ],
  agentFaqs: [
    { id: "how-is-data-privacy-maintained-in-cross-agent-coordination", question: "How is data privacy maintained in cross-agent coordination?", answer: "AEGIS operates on a zero-trust architecture. Raw institutional data never leaves the local node boundary. Nodes exchange anonymized parameter weights, mathematical tokens, and Zero-Knowledge Proofs via cryptographic tunnels." },
    { id: "what-consensus-engine-powers-the-coordination-state-ledger", question: "What consensus engine powers the coordination state ledger?", answer: "The network uses a Byzantine Fault Tolerant Proof-of-Authority consensus optimized for high-throughput microtransactions and low-latency state validation." },
    { id: "how-do-institutions-connect-new-specialized-nodes-to-the-ecosystem", question: "How do institutions connect new specialized nodes to the ecosystem?", answer: "Institutions deploy the AEGIS Node Capsule on local GPU hardware, configure their adapters, and submit a cryptographic authorization request. Once verified, the node registers its agent class and begins coordinating." },
  ],
  sectors: [
    { id: "healthcare", title: "Healthcare", category: "Healthcare", problem: "Data siloes impede accurate diagnoses.", benefits: "Privacy-preserving model fine-tuning.", revenue: "$240B potential size", details: "Detailed diagnostic weight alignment specs and node hardware benchmarks for hospital installations. Aegis coordinates node enclaves to compute gradients homomorphically, ensuring zero patient record exposure." },
    { id: "banking", title: "Banking", category: "Banking", problem: "Rampant transaction fraud leaks capital.", benefits: "Real-time outlier network alerts.", revenue: "$180B potential size", details: "Federated transaction pattern modeling and secure homomorphic anomaly detection system data sheets. Leverages zero-knowledge proofs to coordinate fraud detection parameters across regional bank enclaves." },
    { id: "agriculture", title: "Agriculture", category: "Agriculture", problem: "Erratic local crop yield yields.", benefits: "Localized soil & weather sensor models.", revenue: "$90B potential size", details: "Distributed sensor node network details, local model weights adjustment schemas, and regional crop forecast charts based on decentralized satellite telemetry." },
    { id: "education", title: "Education", category: "Education", problem: "Rigid static course curricula.", benefits: "Dynamic personalized student models.", revenue: "$120B potential size", details: "Student vector alignment pipelines, custom LoRA generation specs, and secure knowledge graph retrieval schemas running on university node arrays." },
    { id: "research", title: "Research", category: "Research", problem: "Slow empirical validation cycles.", benefits: "Automated simulation synthesis.", revenue: "$150B potential size", details: "Academic cluster computing specifications, ZK proof gradient validations, and public data source integration specs for open-source model replication." },
    { id: "insurance", title: "Insurance", category: "Banking", problem: "High claim validation backlogs.", benefits: "Dynamic actuarial model assessment.", revenue: "$140B potential size", details: "Dynamic actuarial model parameters, risk prediction vector formulas, and verified compute ledger audits executed automatically by smart insurance agents." },
    { id: "manufacturing", title: "Manufacturing", category: "Manufacturing", problem: "Unplanned device system failures.", benefits: "Predictive asset lifecycle tracking.", revenue: "$165B potential size", details: "Industrial telemetry parsing adaptors, machine predictive maintenance models, and edge compute requirements for local factory servers." },
    { id: "retail", title: "Retail", category: "Manufacturing", problem: "Mismatched supply and demands.", benefits: "Dynamic predictive ordering pipelines.", revenue: "$210B potential size", details: "Consensus inventory tracking pipelines, distribution optimization charts, and retail node coordination vectors for cross-company logistic nodes." },
    { id: "energy", title: "Energy", category: "Manufacturing", problem: "Inefficient electrical distribution.", benefits: "Smart grid flow load prediction.", revenue: "$130B potential size", details: "Grid network coordinate load prediction systems, localized energy storage routing, and real-time consumption node telemetry parameters." },
    { id: "transportation", title: "Transportation", category: "Manufacturing", problem: "Sub-optimal vehicle routes.", benefits: "Federated coordinate navigation.", revenue: "$115B potential size", details: "Federated navigation nodes coordination protocols, real-time traffic routing vectors, and vehicle telemetry integration latency benchmarks." },
    { id: "telecom", title: "Telecom", category: "Government", problem: "Bandwidth drop-offs during spikes.", benefits: "Dynamic cell router allocations.", revenue: "$95B potential size", details: "SDR cell tower routing algorithms, dynamic network load balancing systems, and edge cell node hardware requirements for municipal grids." },
    { id: "environment", title: "Environment", category: "Agriculture", problem: "Delayed forest fire warning times.", benefits: "Sensor networks processing locally.", revenue: "$80B potential size", details: "Low-power edge sensing parameters, automated infrared alert classification, and local alert nodes mesh designs for national forest parks." },
    { id: "government", title: "Government", category: "Government", problem: "High administrative filing friction.", benefits: "Automated document sorting pipelines.", revenue: "$175B potential size", details: "Secured federal document indexing modules, automated translation pipelines, and localized public data nodes complying with federal audit rules." },
    { id: "legal", title: "Legal", category: "Government", problem: "Laborious document review cycles.", benefits: "Fast precedent search & matching.", revenue: "$85B potential size", details: "Semantic legal vector embeddings, court precedent citation indices, and secure case search enclaves for municipal law centers." },
    { id: "media", title: "Media", category: "Education", problem: "Low context recommendations.", benefits: "Deep semantic interest vectoring.", revenue: "$110B potential size", details: "Secure local interest vectoring, conceptual movie/text mapping databases, and cross-node similarity indexes that avoid storing user history." },
    { id: "hr", title: "HR", category: "Education", problem: "Out-of-date candidate reviews.", benefits: "Automated resume parsing/ranking.", revenue: "$70B potential size", details: "Structured candidate qualification parse protocols, skill vector indexing, and automated interview simulation agents for screening." },
    { id: "real-estate", title: "Real Estate", category: "Banking", problem: "Mismatched property valuations.", benefits: "Predictive yield modeling indices.", revenue: "$105B potential size", details: "Predictive valuation indices, local market factor weighting vectors, and node coordinate verification rules for land title registries." },
    { id: "supply-chain", title: "Supply Chain", category: "Manufacturing", problem: "Frequent port delivery backlogs.", benefits: "Consensus cargo routing vectors.", revenue: "$160B potential size", details: "Global port freight coordinate tracking ledger, multi-node supply routing optimization, and node latency stats for maritime grids." },
    { id: "pharmaceuticals", title: "Pharmaceuticals", category: "Healthcare", problem: "Long molecular discovery timelines.", benefits: "Automated chemical screening loops.", revenue: "$225B potential size", details: "Molecular binding energy prediction networks, automated synthesis validation loops, and clinical trial enclaves for collaborative pharma nodes." },
  ],
  websiteFaqs: [
    { id: "why-does-the-daemon-bootloader-output-daemon-failed-to-initialize-within-timeout-on-start", question: "Why does the daemon bootloader output 'Daemon failed to initialize within timeout' on start?", answer: "This usually indicates an engine loading failure during the microkernel's startup validation phase. Check the active log file at workspace/logs/daemon_boot.log. A common issue is a mismatched engine dependency ID in the manifest file or class metadata. For example, if your engine configuration lists a dependency as distributed-inference but the target engine registers its ID as aegis-distributed-inference, the kernel's topological check will fail and isolate the system in Safe Mode.", category: "Microkernel" },
    { id: "how-do-i-run-a-local-training-job-and-inspect-the-resulting-adapter-files", question: "How do I run a local training job and inspect the resulting adapter files?", answer: "You can queue a job through the ASDK system call interface. The training engine optimizer executes epochs on your selected framework (e.g., PyTorch) and exports a LoRA adapter. To inspect the files, run a local training run: Model checkpoints are saved under .aegis/checkpoints/<job-id>/, and exported adapters are saved under .aegis/exports/<lora-id>/ upon completion. Key files include: adapter_config.json (hyperparameters), adapter_model.safetensors (optimized delta weight tensors), and export_metadata.json (signed audit manifest containing performance statistics and verification hashes).", category: "System Specs" },
    { id: "where-are-models-and-weights-from-other-nodes-saved-locally-when-doing-p2p-learning", question: "Where are models and weights from other nodes saved locally when doing P2P learning?", answer: "P2P LoRA adapters are saved to workspace/lora/ as <lora-adapter-id>.json along with their signed verification key sidecars (.meta.json). Active round checkpoints during collaborative epochs are saved to workspace/learning-checkpoints/.", category: "System Specs" },
    { id: "how-do-i-deploy-aegis-on-another-machine-and-connect-it-to-my-cluster", question: "How do I deploy AEGIS on another machine and connect it to my cluster?", answer: "1. Clone the repository and run npm install && npm run build on Node B.\n2. Register default packages by running node register-default-engines.mjs.\n3. In Node B's configuration (workspace/config/node.json), append Node A's IP address and port to the bootstrap peers array (e.g., \"192.168.1.50:3010\").\n4. Boot both runtimes using aegis-cli runtime start.\n5. Call aegis.discoverNodes() via the SDK to initiate secure mTLS handshakes.", category: "Swarm" },
    { id: "if-a-cluster-has-100-nodes-but-only-15-participate-how-do-roles-work-if-some-are-clients-some-are-servers-and-some-are-aggregators", question: "If a cluster has 100 nodes but only 15 participate, how do roles work if some are clients, some are servers, and some are aggregators?", answer: "In AEGIS, roles are not static; they are dynamically mapped based on the Capability Registry of the active participants: Nodes with data/training engines act as Workers (Client nodes); Nodes with averaging/validation engines act as Aggregators; Nodes with directory/distribution engines act as Coordinating Servers. The server queries the capability registry of the 15 online nodes, assigning training epochs to the Clients, validation/averaging tasks to the Aggregators, and publication tasks to the Servers. If critical capabilities are missing, the system gracefully falls back to delegated aggregation on idle cluster peers.", category: "Swarm" },
    { id: "what-is-the-difference-between-an-aggregator-and-a-subject", question: "What is the difference between an Aggregator and a Server?", answer: "Aggregator: Handles tensor math. It aggregates weights from clients, runs algorithms like FedAvg, filters out poisoned/malicious updates, and compresses/quantizes weights. It requires GPU compute resources. Server: Handles orchestration. It coordinates node handshakes, indexes active sessions, manages state events, and publishes final models via gateways. It requires storage and network I/O.", category: "Swarm" },
    { id: "why-is-ipc-the-default-local-transport-rather-than-websockets-or-grpc", question: "Why is IPC the default local transport rather than WebSockets or gRPC?", answer: "Inter-Process Communication (IPC) is the default local transport because it is a low-overhead, low-latency channel that operates entirely within the OS socket space. Unlike TCP networks, it does not require opening external network ports, which mitigates common security vulnerabilities in local desktop installations.", category: "Network" },
    { id: "how-should-i-choose-between-rest-websockets-and-grpc-in-my-integration", question: "How should I choose between REST, WebSockets, and gRPC in my integration?", answer: "REST: Best for simple, stateless request-response operations like configuration adjustments or listing models. WebSockets: Ideal for persistent bidirectional streams such as event logging, telemetry updates, and token generation streams. gRPC: Preferred for enterprise-grade deployments, Kubernetes microservice routing, and cloud-to-edge integrations.", category: "Network" },
    { id: "why-are-packages-compiled-as-standard-zip-archives-but-given-aeg-and-aegbundle-extensions", question: "Why are packages compiled as standard ZIP archives but given .aeg and .aegbundle extensions?", answer: "Defining .aeg and .aegbundle as logical extensions while maintaining standard ZIP formats enables transparent archiving: The extension allows the package manager to immediately identify and validate the asset type (package vs bundle). The underlying standard ZIP container ensures cross-platform compatibility, making packaging, compression, and analysis easy.", category: "System Specs" }
  ],
  subsystems: [
    { id: "aegis-kernel-runtime", name: "AEGIS Kernel & Runtime", short: "Kernel Core", desc: "The life cycle management foundation of the entire operating system. It supervises all active subsystems, routes message buses, and manages startup and shutdown sequences.", features: "Standardized IoC dependency injections, Topological engine loading sort, Strongly-typed EventBus, Periodic status health checks" },
    { id: "node-platform-package-manager", name: "Node Platform & Package Manager", short: "Package Manager", desc: "The secure verification gateway. It handles package installation, ownership validation, dependency trees, and signature checks using digital certificates.", features: "Digital signature validation, Standardized .aeg package format, Automatic dependency resolution, Transactional install rollbacks" },
    { id: "distributed-intelligence-engine-die", name: "Distributed Intelligence Engine (DIE)", short: "DIE C++20 Daemon", desc: "A high-performance, native C++ daemon managing discovery, P2P socket communication, and worker thread scheduler bounds.", features: "Low-latency BSD socket transport, mTLS tunnel handshakes, STUN hole punching Nat traversal, Zero-broker task placement scheduling" },
    { id: "cognitive-memory-engine", name: "Cognitive Memory Engine", short: "Cognitive Memory", desc: "A multi-tiered semantic context repository. It manages short-term conversational buffers, semantic search indexing, memory reflection updates, and transactional write-buffers.", features: "Short-term conversational buffers, Semantic search indexing (Vector Database), Write-coalescing debounce buffers, ACID-like transaction safeguards" },
    { id: "aegis-data-engine-ade", name: "AEGIS Data Engine (ADE)", short: "Data Engine", desc: "A privacy-first pipeline responsible for scanning, validating, and structuring local raw data, preparing it for local training loops.", features: "PII scrubbing filters, Local dataset formatting pipelines, Data integrity validation checks, Encrypted local SQLite storage" },
    { id: "aegis-distributed-learning-engine-adle", name: "AEGIS Distributed Learning Engine (ADLE)", short: "ADLE (Learning)", desc: "An automated machine learning manager. It orchestrates local training loops, checks gradients, aggregates model weights, and publishes tuned LoRA adapters.", features: "Local training loops (PyTorch), Swarm Federated Learning updates, Secure Homomorphic gradient blending, Loss/validation curves telemetry" },
    { id: "aegis-secure-collaboration-protocol-ascip", name: "AEGIS Secure Collaboration Protocol (ASCIP)", short: "ASCIP (Consensus)", desc: "The negotiation and consensus engine. Sovereign nodes delegate sub-tasks, discover capabilities, exchange packages, and reach a consensus.", features: "Decentralized capability discovery, Byzantine Fault Tolerant voting, Reputation-weighted node scoring, Encrypted peer negotiations" },
    { id: "ai-runtime-v2-air-v2", name: "AI Runtime v2 (AIR v2)", short: "AIR v2 (Router)", desc: "The universal execution router. It maps incoming prompts to optimal hardware backends based on location policies.", features: "Local Llama.cpp & Ollama bindings, Encrypted remote cloud routing fallback, Location policy constraints enforcement, Multi-model resident session pools" },
    { id: "aegis-collective-intelligence-engine-acie", name: "AEGIS Collective Intelligence Engine (ACIE)", short: "ACIE (Evolution)", desc: "The cognitive evolution layer. ACIE continuously observes completed executions, reflects on successes/failures, and distills reasoning traces.", features: "Knowledge Object distillation, Decentralized Experience Graph links, Post-execution accuracy scoring, Pre-execution recommendation vectors" }
  ],
};

const defaultResearchPublications = [
  {
    title: "AEGIS: Sovereign, Privacy-Preserving Collective Intelligence Infrastructure",
    slug: "aegis-vision-whitepaper",
    category: "Whitepaper",
    abstract: "This paper introduces the AEGIS Distributed AI Operating System, focusing on zero-trust execution boundaries, cryptographic enclaves, and localized federated learning methodologies.",
    authors: "AEGIS Systems Research Team",
    date: "Jan 2026",
    pdfUrl: "/assets/documents/AEGIS_Vision_Whitepaper.pdf",
    tags: "Privacy, Zero-Trust, Swarm Learning, Blockchain",
    timestamp: Date.now() - 3600 * 1000 * 24 * 180 // 180 days ago
  },
  {
    title: "Decentralized FedAvg Optimizations for Parameter-Efficient LoRA Tuning",
    slug: "federated-lora-aggregation",
    category: "Technical Paper",
    abstract: "We detail the mathematical specifications of homomorphic weight updates across heterogeneous nodes under the ADLE engine, illustrating 95% bandwidth savings compared to traditional full weight consolidations.",
    authors: "Distributed Intelligence Group (DIE)",
    date: "Mar 2026",
    pdfUrl: "/assets/documents/Federated_LoRA_Aggregation.pdf",
    tags: "FedAvg, LoRA, ADLE, Optimizers",
    timestamp: Date.now() - 3600 * 1000 * 24 * 120 // 120 days ago
  },
  {
    title: "Byzantine Fault Tolerant Transport over STUN/Noise mTLS Channels",
    slug: "aegis-overlay-network-spec",
    category: "System Specs",
    abstract: "This paper outlines the technical architecture of the AEGIS Overlay Network (AON). It covers STUN hole punching mechanics, Noise_IK handshake encryption schemes, and packet framing configurations built to bypass strict firewalls.",
    authors: "Network Systems Laboratory",
    date: "Apr 2026",
    pdfUrl: "/assets/documents/Node_System_Specifications.pdf",
    tags: "STUN, Noise_IK, Named Pipes, Unix Sockets",
    timestamp: Date.now() - 3600 * 1000 * 24 * 90 // 90 days ago
  },
  {
    title: "Demystifying AEGIS: Sovereign, Privacy-First Collective Intelligence",
    slug: "aegis-sovereign-networks-blog",
    category: "Blog Essay",
    abstract: "A comprehensive introductory guide explaining the 9 core engines (Runtime Kernel, Package Manager, DIE, Cognitive Memory, Data Engine, ADLE, ASCIP, AIR v2, ACIE) and real customer cases in Healthcare, Finance, and Government enclaves.",
    authors: "AEGIS AI Foundation",
    date: "Jun 2026",
    pdfUrl: "",
    tags: "Core Subsystems, Multi-Agent Systems, Cognitive Memory",
    timestamp: Date.now() - 3600 * 1000 * 24 * 30 // 30 days ago
  }
];

const email = "aegisaifoundation@gmail.com";
const password = "adminpassword123";

async function seedWebsiteData() {
  console.log("==========================================");
  console.log("AEGIS DATABASE WEBSITE DATA SEEDER");
  console.log("==========================================");
  console.log("Starting Firebase Admin Authentication...");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log(`[AUTH] Admin successfully signed in. UID: ${userCredential.user.uid}`);
    console.log("Starting Firestore collections write...\n");

    // 1. Seed 'website_data/general'
    const generalDocRef = doc(db, "website_data", "general");
    await setDoc(generalDocRef, defaultGeneralContent);
    console.log("[FIRESTORE] General page content seeded inside 'website_data/general'.");

    // 2. Seed 'website_data/cards'
    const cardsDocRef = doc(db, "website_data", "cards");
    await setDoc(cardsDocRef, defaultCardContent);
    console.log("[FIRESTORE] Cards layout and lists seeded inside 'website_data/cards'.");

    // 3. Seed 'research' collection
    for (const paper of defaultResearchPublications) {
      const paperRef = doc(db, "research", paper.slug);
      await setDoc(paperRef, paper);
      console.log(`[FIRESTORE] Research paper seeded: "${paper.title}" -> 'research/${paper.slug}'.`);
    }

    console.log("\n==========================================");
    console.log("SUCCESS: Website data seeded successfully!");
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("\n==========================================");
    console.error("ERROR: website data seeding failed!");
    console.error(error.message);
    console.error("==========================================");
    process.exit(1);
  }
}

seedWebsiteData();
