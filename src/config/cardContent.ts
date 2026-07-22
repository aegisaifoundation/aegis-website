"use client";

import { useEffect, useState } from "react";

export type TechnologyCard = { id: string; title: string; desc: string; spec: string };
export type RevenueCard = { id: string; title: string; desc: string };
export type SectorCard = { id: string; title: string; category: string; problem: string; benefits: string; revenue: string; details: string };
export type AgentCard = { id: string; title: string; class: string; desc: string; inputs: string; consensus: string; coordination: string; kpis: string };
export type AgentFaq = { id: string; question: string; answer: string };
export type WebsiteFaq = { id: string; question: string; answer: string; category: string };
export type SubsystemCard = { id: string; name: string; short: string; desc: string; features: string };

export type CardContent = {
  technology: TechnologyCard[];
  sectors: SectorCard[];
  revenue: RevenueCard[];
  agents: AgentCard[];
  agentFaqs: AgentFaq[];
  websiteFaqs: WebsiteFaq[];
  subsystems: SubsystemCard[];
};

const id = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const defaultCardContent: CardContent = {
  technology: [
    ["Multi-Agent Systems", "Collaborative, autonomous AI units executing complex multi-step reasoning cycles.", "Dynamic task delegation"],
    ["RAG", "Retrieval-Augmented Generation linking reasoning engines with secure context sources.", "Semantic document vector indexing"],
    ["Vector Databases", "High-performance vector space engines optimized for semantic similarity queries.", "Sub-millisecond retrieval speeds"],
    ["Knowledge Graphs", "Structured conceptual node maps connecting facts, relationships, and context.", "Triple-store factual indexing"],
    ["Federated Learning", "Privacy-preserving collaborative training that compiles model updates locally.", "Zero-Knowledge model adjustments"],
    ["Selective LoRA", "Weight adaptation targeting specific transformer layers, minimizing overhead.", "Parameter-efficient tuning"],
    ["Secure Aggregation", "Cryptographic consensus blending model gradients without weight exposure.", "Homomorphic encryption layers"],
    ["Trust Engine", "Adversarial shield analyzing queries and outputs for safety compliance.", "Real-time prompt protection"],
    ["Blockchain Layer", "Immutable distributed ledger verifying and logging node compute histories.", "Smart-contract verified audits"],
  ].map(([title, desc, spec]) => ({ id: id(title), title, desc, spec })),
  revenue: [
    ["Subscriptions", "Flat rate plans for nodes accessing global consensus weights."], ["Agent as a Service", "Lease domain-specific agents (Doctor, Legal, Banking) locally."], ["API Access", "Secure gateway endpoints for external applications querying models."], ["White Label", "Deploy custom partitioned networks for private enterprises."], ["Marketplace", "Trade specialized LoRA adapters and custom knowledge graphs."], ["Research Access", "Subsidized subscriptions for academic and non-profit centers."], ["Government Contracts", "Custom federal secure-node clusters and analytics layers."], ["Certification", "Audit and verify third-party agent safety compliance states."], ["Premium Intelligence", "Access high-compute fine-tuned reasoning blocks."],
  ].map(([title, desc]) => ({ id: id(title), title, desc })),
  agents: [
    ["Research Agent", "AEGIS-RES-01", "Accelerates scientific discoveries, catalogs academic literature, and validates experimental models across medical and environmental nodes.", "Scientific Journals, Raw Experiment Telemetry, Molecular Simulation Indices, Adaptation Datasets", "Runs federated parameter aggregation models and verifies validation accuracy via Zero-Knowledge consensus channels.", "Doctor Agent, Agriculture Agent", "Adaptation Accuracy|99.8%; Sync Latency|142 ms; Active Nodes|2,840"],
    ["Doctor Agent", "AEGIS-MED-02", "Assists clinical diagnostics, parses healthcare records, and structures patient care pathways locally inside hospital boundary zones.", "Electronic Health Records, DICOM Imaging Metrics, Lab Telemetry Streams, Symptom Logs", "Executes de-identified token verification and Multi-Party Secure computations to generate diagnostic suggestions.", "Legal Agent, Research Agent", "Diagnostic Accuracy|99.4%; Symptom Parsing Delay|98 ms; Active Nodes|1,220"],
    ["Education Agent", "AEGIS-EDU-03", "Personalizes learning curricula, structures academic databases, and generates interactive quizzes adapted to node performance indicators.", "Academic Textbooks, Student Performance Data, Curriculum Catalogs, Exam Results", "Validates decentralized Proof-of-Skill logs and anonymized student learning progress benchmarks.", "Government Agent", "Engagement Rating|4.8/5.0; Query Response Speed|65 ms; Active Nodes|4,110"],
    ["Government Agent", "AEGIS-GOV-04", "Streamlines municipal filing procedures, indexes legislative databases, and audits public records with mathematical certainty.", "Municipal Filing Sheets, Public Land Registries, Legislative Policies, Identity Validation Tokens", "Ensures Zero-Disclosure document routing audits and validates state authority multi-signatures.", "Legal Agent, Education Agent", "Audit Integrity|100%; Filing Validation Speed|240 ms; Active Nodes|850"],
    ["Agriculture Agent", "AEGIS-AGR-05", "Analyzes crop yields, monitors localized sensor networks, and coordinates soil treatment adaptations in real time.", "Soil Sensor Telemetry, Satellite Weather Maps, Crop Yield Logs, Resource Budgets", "Proof-of-Authority consensus checking for regional resource distribution algorithms and weather prediction models.", "Research Agent", "Yield Improvement Index|+14.8%; Sync Telemetry Rate|1.2s; Active Nodes|920"],
    ["Banking Agent", "AEGIS-FIN-06", "Identifies transaction anomalies, checks credit histories, and audits institutional compliance policies on isolated nodes.", "Transaction Ledgers, Credit Score Histories, Market FX Price Lists, Compliance Regulations", "Resolves Zero-Knowledge financial transfers and handles multi-party encrypted ledger settlements.", "Legal Agent, Insurance Agent", "False Positive Ratio|0.0001%; Clearing Speed|110 ms; Active Nodes|1,940"],
    ["Legal Agent", "AEGIS-LGL-07", "Indexes statutory precedents, checks case citations, and highlights contract clauses to ensure compliance in coordinate events.", "Civil Statutes, Contract Drafts, Compliance Guidelines, Case Precedents", "Runs cryptographic clause parsing algorithms and audits Proof-of-Consent ledger signatures.", "Government Agent, Doctor Agent, Banking Agent", "Clause Parsing Accuracy|98.9%; Verification Latency|160 ms; Active Nodes|680"],
    ["Manufacturing Agent", "AEGIS-MFG-08", "Predicts assembly machine breakdowns, monitors SCADA systems, and maps logistics lines for institutional factory nodes.", "Vibration Sensors, Temperature Logs, Vendor Shipments, Operational Logs", "Byzantine Fault Tolerant telemetry checks and coordinates multi-node product adaptation pipelines.", "Supply Chain Agent", "Downtime Prevention|+28.0%; Sensor Ping Delay|45 ms; Active Nodes|1,350"],
    ["Insurance Agent", "AEGIS-INS-09", "Models actuarial risk factors, automates claim filing pipelines, and checks policy limits against coordination ledgers.", "Actuarial Probability Lists, Claim Documents, Policy Parameters, Property Logs", "Validates multi-party auto-claim approvals and checks Proof-of-Loss hashes in real time.", "Banking Agent", "Automated Payout Rate|92%; Policy Check Speed|180 ms; Active Nodes|1,140"],
    ["Supply Chain Agent", "AEGIS-SCM-10", "Balances warehouse stocks, optimizes delivery routes, and tracks global vendor shipping metrics between enterprise nodes.", "Inventory Data, Vehicle GPS Feeds, Vendor Invoices, Shipping Ledgers", "Decentralized state verification for shipments and registers Proof-of-Delivery smart contracts.", "Manufacturing Agent", "Transit Time Savings|18.2%; Telemetry Update Sync|75 ms; Active Nodes|2,120"],
  ].map(([title, agentClass, desc, inputs, consensus, coordination, kpis]) => ({ id: id(title), title, class: agentClass, desc, inputs, consensus, coordination, kpis })),
  agentFaqs: [
    ["How is data privacy maintained in cross-agent coordination?", "AEGIS operates on a zero-trust architecture. Raw institutional data never leaves the local node boundary. Nodes exchange anonymized parameter weights, mathematical tokens, and Zero-Knowledge Proofs via cryptographic tunnels."],
    ["What consensus engine powers the coordination state ledger?", "The network uses a Byzantine Fault Tolerant Proof-of-Authority consensus optimized for high-throughput microtransactions and low-latency state validation."],
    ["How do institutions connect new specialized nodes to the ecosystem?", "Institutions deploy the AEGIS Node Capsule on local GPU hardware, configure their adapters, and submit a cryptographic authorization request. Once verified, the node registers its agent class and begins coordinating."],
  ].map(([question, answer]) => ({ id: id(question), question, answer })),
  sectors: [
    ["Healthcare", "Healthcare", "Data siloes impede accurate diagnoses.", "Privacy-preserving model fine-tuning.", "$240B potential size", "Detailed diagnostic weight alignment specs and node hardware benchmarks for hospital installations. Aegis coordinates node enclaves to compute gradients homomorphically, ensuring zero patient record exposure."],
    ["Banking", "Banking", "Rampant transaction fraud leaks capital.", "Real-time outlier network alerts.", "$180B potential size", "Federated transaction pattern modeling and secure homomorphic anomaly detection system data sheets. Leverages zero-knowledge proofs to coordinate fraud detection parameters across regional bank enclaves."],
    ["Agriculture", "Agriculture", "Erratic local crop yield yields.", "Localized soil & weather sensor models.", "$90B potential size", "Distributed sensor node network details, local model weights adjustment schemas, and regional crop forecast charts based on decentralized satellite telemetry."],
    ["Education", "Education", "Rigid static course curricula.", "Dynamic personalized student models.", "$120B potential size", "Student vector alignment pipelines, custom LoRA generation specs, and secure knowledge graph retrieval schemas running on university node arrays."],
    ["Research", "Research", "Slow empirical validation cycles.", "Automated simulation synthesis.", "$150B potential size", "Academic cluster computing specifications, ZK proof gradient validations, and public data source integration specs for open-source model replication."],
    ["Insurance", "Banking", "High claim validation backlogs.", "Dynamic actuarial model assessment.", "$140B potential size", "Dynamic actuarial model parameters, risk prediction vector formulas, and verified compute ledger audits executed automatically by smart insurance agents."],
    ["Manufacturing", "Manufacturing", "Unplanned device system failures.", "Predictive asset lifecycle tracking.", "$165B potential size", "Industrial telemetry parsing adaptors, machine predictive maintenance models, and edge compute requirements for local factory servers."],
    ["Retail", "Manufacturing", "Mismatched supply and demands.", "Dynamic predictive ordering pipelines.", "$210B potential size", "Consensus inventory tracking pipelines, distribution optimization charts, and retail node coordination vectors for cross-company logistic nodes."],
    ["Energy", "Manufacturing", "Inefficient electrical distribution.", "Smart grid flow load prediction.", "$130B potential size", "Grid network coordinate load prediction systems, localized energy storage routing, and real-time consumption node telemetry parameters."],
    ["Transportation", "Manufacturing", "Sub-optimal vehicle routes.", "Federated coordinate navigation.", "$115B potential size", "Federated navigation nodes coordination protocols, real-time traffic routing vectors, and vehicle telemetry integration latency benchmarks."],
    ["Telecom", "Government", "Bandwidth drop-offs during spikes.", "Dynamic cell router allocations.", "$95B potential size", "SDR cell tower routing algorithms, dynamic network load balancing systems, and edge cell node hardware requirements for municipal grids."],
    ["Environment", "Agriculture", "Delayed forest fire warning times.", "Sensor networks processing locally.", "$80B potential size", "Low-power edge sensing parameters, automated infrared alert classification, and local alert nodes mesh designs for national forest parks."],
    ["Government", "Government", "High administrative filing friction.", "Automated document sorting pipelines.", "$175B potential size", "Secured federal document indexing modules, automated translation pipelines, and localized public data nodes complying with federal audit rules."],
    ["Legal", "Government", "Laborious document review cycles.", "Fast precedent search & matching.", "$85B potential size", "Semantic legal vector embeddings, court precedent citation indices, and secure case search enclaves for municipal law centers."],
    ["Media", "Education", "Low context recommendations.", "Deep semantic interest vectoring.", "$110B potential size", "Secure local interest vectoring, conceptual movie/text mapping databases, and cross-node similarity indexes that avoid storing user history."],
    ["HR", "Education", "Out-of-date candidate reviews.", "Automated resume parsing/ranking.", "$70B potential size", "Structured candidate qualification parse protocols, skill vector indexing, and automated interview simulation agents for screening."],
    ["Real Estate", "Banking", "Mismatched property valuations.", "Predictive yield modeling indices.", "$105B potential size", "Predictive valuation indices, local market factor weighting vectors, and node coordinate verification rules for land title registries."],
    ["Supply Chain", "Manufacturing", "Frequent port delivery backlogs.", "Consensus cargo routing vectors.", "$160B potential size", "Global port freight coordinate tracking ledger, multi-node supply routing optimization, and node latency stats for maritime grids."],
    ["Pharmaceuticals", "Healthcare", "Long molecular discovery timelines.", "Automated chemical screening loops.", "$225B potential size", "Molecular binding energy prediction networks, automated synthesis validation loops, and clinical trial enclaves for collaborative pharma nodes."],
  ].map(([title, category, problem, benefits, revenue, details]) => ({ id: id(title), title, category, problem, benefits, revenue, details })),
  websiteFaqs: [
    ["Why does the daemon bootloader output 'Daemon failed to initialize within timeout' on start?", "This usually indicates an engine loading failure during the microkernel's startup validation phase. Check the active log file at workspace/logs/daemon_boot.log. A common issue is a mismatched engine dependency ID in the manifest file or class metadata. For example, if your engine configuration lists a dependency as distributed-inference but the target engine registers its ID as aegis-distributed-inference, the kernel's topological check will fail and isolate the system in Safe Mode.", "Microkernel"],
    ["How do I run a local training job and inspect the resulting adapter files?", "You can queue a job through the ASDK system call interface. The training engine optimizer executes epochs on your selected framework (e.g., PyTorch) and exports a LoRA adapter. To inspect the files, run a local training run: Model checkpoints are saved under .aegis/checkpoints/<job-id>/, and exported adapters are saved under .aegis/exports/<lora-id>/ upon completion. Key files include: adapter_config.json (hyperparameters), adapter_model.safetensors (optimized delta weight tensors), and export_metadata.json (signed audit manifest containing performance statistics and verification hashes).", "System Specs"],
    ["Where are models and weights from other nodes saved locally when doing P2P learning?", "P2P LoRA adapters are saved to workspace/lora/ as <lora-adapter-id>.json along with their signed verification key sidecars (.meta.json). Active round checkpoints during collaborative epochs are saved to workspace/learning-checkpoints/.", "System Specs"],
    ["How do I deploy AEGIS on another machine and connect it to my cluster?", "1. Clone the repository and run npm install && npm run build on Node B.\n2. Register default packages by running node register-default-engines.mjs.\n3. In Node B's configuration (workspace/config/node.json), append Node A's IP address and port to the bootstrap peers array (e.g., \"192.168.1.50:3010\").\n4. Boot both runtimes using aegis-cli runtime start.\n5. Call aegis.discoverNodes() via the SDK to initiate secure mTLS handshakes.", "Swarm"],
    ["If a cluster has 100 nodes but only 15 participate, how do roles work if some are clients, some are servers, and some are aggregators?", "In AEGIS, roles are not static; they are dynamically mapped based on the Capability Registry of the active participants: Nodes with data/training engines act as Workers (Client nodes); Nodes with averaging/validation engines act as Aggregators; Nodes with directory/distribution engines act as Coordinating Servers. The server queries the capability registry of the 15 online nodes, assigning training epochs to the Clients, validation/averaging tasks to the Aggregators, and publication tasks to the Servers. If critical capabilities are missing, the system gracefully falls back to delegated aggregation on idle cluster peers.", "Swarm"],
    ["What is the difference between an Aggregator and a Server?", "Aggregator: Handles tensor math. It aggregates weights from clients, runs algorithms like FedAvg, filters out poisoned/malicious updates, and compresses/quantizes weights. It requires GPU compute resources. Server: Handles orchestration. It coordinates node handshakes, indexes active sessions, manages state events, and publishes final models via gateways. It requires storage and network I/O.", "Swarm"],
    ["Why is IPC the default local transport rather than WebSockets or gRPC?", "Inter-Process Communication (IPC) is the default local transport because it is a low-overhead, low-latency channel that operates entirely within the OS socket space. Unlike TCP networks, it does not require opening external network ports, which mitigates common security vulnerabilities in local desktop installations.", "Network"],
    ["How should I choose between REST, WebSockets, and gRPC in my integration?", "REST: Best for simple, stateless request-response operations like configuration adjustments or listing models. WebSockets: Ideal for persistent bidirectional streams such as event logging, telemetry updates, and token generation streams. gRPC: Preferred for enterprise-grade deployments, Kubernetes microservice routing, and cloud-to-edge integrations.", "Network"],
    ["Why are packages compiled as standard ZIP archives but given .aeg and .aegbundle extensions?", "Defining .aeg and .aegbundle as logical extensions while maintaining standard ZIP formats enables transparent archiving: The extension allows the package manager to immediately identify and validate the asset type (package vs bundle). The underlying standard ZIP container ensures cross-platform compatibility, making packaging, compression, and analysis easy.", "System Specs"]
  ].map(([question, answer, category]) => ({ id: id(question), question, answer, category })),
  subsystems: [
    ["AEGIS Kernel & Runtime", "Kernel Core", "The life cycle management foundation of the entire operating system. It supervises all active subsystems, routes message buses, and manages startup and shutdown sequences.", "Standardized IoC dependency injections, Topological engine loading sort, Strongly-typed EventBus, Periodic status health checks"],
    ["Node Platform & Package Manager", "Package Manager", "The secure verification gateway. It handles package installation, ownership validation, dependency trees, and signature checks using digital certificates.", "Digital signature validation, Standardized .aeg package format, Automatic dependency resolution, Transactional install rollbacks"],
    ["Distributed Intelligence Engine (DIE)", "DIE C++20 Daemon", "A high-performance, native C++ daemon managing discovery, P2P socket communication, and worker thread scheduler bounds.", "Low-latency BSD socket transport, mTLS tunnel handshakes, STUN hole punching Nat traversal, Zero-broker task placement scheduling"],
    ["Cognitive Memory Engine", "Cognitive Memory", "A multi-tiered semantic context repository. It manages short-term conversational buffers, semantic search indexing, memory reflection updates, and transactional write-buffers.", "Short-term conversational buffers, Semantic search indexing (Vector Database), Write-coalescing debounce buffers, ACID-like transaction safeguards"],
    ["AEGIS Data Engine (ADE)", "Data Engine", "A privacy-first pipeline responsible for scanning, validating, and structuring local raw data, preparing it for local training loops.", "PII scrubbing filters, Local dataset formatting pipelines, Data integrity validation checks, Encrypted local SQLite storage"],
    ["AEGIS Distributed Learning Engine (ADLE)", "ADLE (Learning)", "An automated machine learning manager. It orchestrates local training loops, checks gradients, aggregates model weights, and publishes tuned LoRA adapters.", "Local training loops (PyTorch), Swarm Federated Learning updates, Secure Homomorphic gradient blending, Loss/validation curves telemetry"],
    ["AEGIS Secure Collaboration Protocol (ASCIP)", "ASCIP (Consensus)", "The negotiation and consensus engine. Sovereign nodes delegate sub-tasks, discover capabilities, exchange packages, and reach a consensus.", "Decentralized capability discovery, Byzantine Fault Tolerant voting, Reputation-weighted node scoring, Encrypted peer negotiations"],
    ["AI Runtime v2 (AIR v2)", "AIR v2 (Router)", "The universal execution router. It maps incoming prompts to optimal hardware backends based on location policies.", "Local Llama.cpp & Ollama bindings, Encrypted remote cloud routing fallback, Location policy constraints enforcement, Multi-model resident session pools"],
    ["AEGIS Collective Intelligence Engine (ACIE)", "ACIE (Evolution)", "The cognitive evolution layer. ACIE continuously observes completed executions, reflects on successes/failures, and distills reasoning traces.", "Knowledge Object distillation, Decentralized Experience Graph links, Post-execution accuracy scoring, Pre-execution recommendation vectors"]
  ].map(([name, short, desc, features]) => ({ id: id(name), name, short, desc, features })),
};

const storageKey = "aegis_card_content";
export function readCardContent(): CardContent {
  if (typeof window === "undefined") return defaultCardContent;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    return saved ? { ...defaultCardContent, ...saved } : defaultCardContent;
  } catch { return defaultCardContent; }
}

import { db, auth } from "./firebase";
import { doc, onSnapshot, setDoc, getDoc, collection } from "firebase/firestore";

export async function saveCardContent(content: CardContent) {
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(content));
    window.dispatchEvent(new Event("aegis-card-content-changed"));
  }
  try {
    const docRef = doc(db, "website_data", "cards");

    // Version History backup
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const backupRef = doc(collection(db, "website_versions"));
      await setDoc(backupRef, {
        type: "cards",
        content: snap.data(),
        updatedBy: auth.currentUser?.email || "admin",
        updatedAt: new Date().toISOString(),
        timestamp: Date.now(),
      });
    }

    await setDoc(docRef, content);
  } catch (err) {
    console.error("Firestore card content save and backup failed:", err);
  }
}

export function useCardContent() {
  const [content, setContent] = useState<CardContent>(() => readCardContent());

  useEffect(() => {
    const sync = () => setContent(readCardContent());
    window.addEventListener("aegis-card-content-changed", sync);

    let unsubscribe = () => {};
    try {
      const docRef = doc(db, "website_data", "cards");
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as CardContent;
          setContent(data);
          if (typeof window !== "undefined") {
            localStorage.setItem(storageKey, JSON.stringify(data));
          }
        } else {
          setDoc(docRef, defaultCardContent).catch(console.error);
        }
      }, (err) => {
        console.warn("Firestore card content listener warning:", err);
      });
    } catch (err) {
      console.error("Firestore hook listener creation failed:", err);
    }

    return () => {
      window.removeEventListener("aegis-card-content-changed", sync);
      unsubscribe();
    };
  }, []);

  return content;
}
