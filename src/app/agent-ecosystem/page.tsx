"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Stethoscope, Scale, Microscope, Landmark, ChevronRight, Share2, ShieldCheck, Network, Activity, Database, Lock, BookOpen, Plus, Minus, GraduationCap, Building, Shovel, Factory, Heart, Truck, Search, Cpu } from "lucide-react";
import Link from "next/link";
import NetworkSphere from "@/components/3d/NetworkSphere";
import { motion, AnimatePresence } from "framer-motion";
import { useCardContent } from "@/config/cardContent";

export default function AgentEcosystemPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedAgentIdx, setSelectedAgentIdx] = useState(0);
  const [agentSearch, setAgentSearch] = useState("");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Live pulsing metrics state
  const [telemetry, setTelemetry] = useState({
    activeAgents: 14208,
    totalTransactions: 982144,
    consensusRate: 99.98,
    avgLatencyMs: 142
  });

  // Telemetry real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        activeAgents: prev.activeAgents + (Math.random() > 0.75 ? 1 : 0),
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 2) + 1,
        consensusRate: Number((99.98 + (Math.random() - 0.5) * 0.003).toFixed(4)),
        avgLatencyMs: 140 + Math.floor(Math.random() * 5)
      }));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const workflowStages = [
    {
      title: "Context Initialization",
      agent: "Doctor Agent",
      icon: Stethoscope,
      description: "Extracts patient telemetry data and symptoms locally without exposing PII (Personally Identifiable Information).",
      action: "Dispatches anonymized token stream to the network consensus layer."
    },
    {
      title: "Policy Verification",
      agent: "Legal Agent",
      icon: Scale,
      description: "Validates token stream compliance against regional healthcare data storage laws and institutional consent logs.",
      action: "Authorizes secure routing coordinates and consensus validation."
    },
    {
      title: "Scientific Synthesis",
      agent: "Research Agent",
      icon: Microscope,
      description: "Aggregates compliant parameters to run federated learning training runs, updating medical treatment models.",
      action: "Publishes localized weights back to the node network."
    },
    {
      title: "Consensus Settlement",
      agent: "Banking Agent",
      icon: Landmark,
      description: "Settles real-time API billing microtransactions and node compute resource payouts to research contributors.",
      action: "Finalizes ledger update and closes task block."
    }
  ];

  const { agentFaqs: faqs } = useCardContent();

  const defaultAgentsData = [
    {
      title: "Research Agent",
      class: "AEGIS-RES-01",
      icon: Microscope,
      desc: "Accelerates scientific discoveries, catalogs academic literature, and validates experimental models across medical and environmental nodes.",
      inputs: ["Scientific Journals", "Raw Experiment Telemetry", "Molecular Simulation Indices", "Adaptation Datasets"],
      consensus: "Runs federated parameter aggregation models and verifies validation accuracy via Zero-Knowledge consensus channels.",
      coordination: ["Doctor Agent", "Agriculture Agent"],
      kpis: [
        { label: "Adaptation Accuracy", value: "99.8%" },
        { label: "Sync Latency", value: "142 ms" },
        { label: "Active Nodes", value: "2,840" }
      ],
      color: "text-blue-400 border-blue-500/20 bg-blue-500/5"
    },
    {
      title: "Doctor Agent",
      class: "AEGIS-MED-02",
      icon: Stethoscope,
      desc: "Assists clinical diagnostics, parses healthcare records, and structures patient care pathways locally inside hospital boundary zones.",
      inputs: ["Electronic Health Records (EHR)", "DICOM Imaging Metrics", "Lab Telemetry streams", "Symptom logs"],
      consensus: "Executes de-identified token verification and Multi-Party Secure computations to generate diagnostics suggestions.",
      coordination: ["Legal Agent", "Research Agent"],
      kpis: [
        { label: "Diagnostic Accuracy", value: "99.4%" },
        { label: "Symptom Parsing Delay", value: "98 ms" },
        { label: "Active Nodes", value: "1,220" }
      ],
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
    },
    {
      title: "Education Agent",
      class: "AEGIS-EDU-03",
      icon: GraduationCap,
      desc: "Personalizes learning curricula, structures academic databases, and generates interactive quizzes adapted to node performance indicators.",
      inputs: ["Academic Textbooks", "Student Performance Data", "Curriculum Catalogs", "Exam Results"],
      consensus: "Validates decentralized Proof-of-Skill logs and logs anonymized student learning progress benchmarks.",
      coordination: ["Government Agent"],
      kpis: [
        { label: "Engagement Rating", value: "4.8/5.0" },
        { label: "Query Response Speed", value: "65 ms" },
        { label: "Active Nodes", value: "4,110" }
      ],
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5"
    },
    {
      title: "Government Agent",
      class: "AEGIS-GOV-04",
      icon: Building,
      desc: "Streamlines municipal filing procedures, indexes legislative databases, and audits public records with mathematical certainty.",
      inputs: ["Municipal Filing Sheets", "Public Land Registries", "Legislative Policies", "Identity Validation Tokens"],
      consensus: "Ensures Zero-Disclosure document routing audits and validates state authority multi-signatures.",
      coordination: ["Legal Agent", "Education Agent"],
      kpis: [
        { label: "Audit Integrity", value: "100%" },
        { label: "Filing Validation Speed", value: "240 ms" },
        { label: "Active Nodes", value: "850" }
      ],
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5"
    },
    {
      title: "Agriculture Agent",
      class: "AEGIS-AGR-05",
      icon: Shovel,
      desc: "Analyzes crop yields, monitors localized SCADA sensor networks, and coordinates soil treatment adaptations in real time.",
      inputs: ["Soil Sensor Telemetry", "Satellite Weather Maps", "Crop Yield Historical Logs", "Resource Budgets"],
      consensus: "Proof-of-Authority consensus checking for regional resource distribution algorithms and weather prediction models.",
      coordination: ["Research Agent"],
      kpis: [
        { label: "Yield Improvement Index", value: "+14.8%" },
        { label: "Sync Telemetry Rate", value: "1.2s" },
        { label: "Active Nodes", value: "920" }
      ],
      color: "text-teal-400 border-teal-500/20 bg-teal-500/5"
    },
    {
      title: "Banking Agent",
      class: "AEGIS-FIN-06",
      icon: Landmark,
      desc: "Identifies transaction anomalies, checks credit histories, and audits institutional compliance policies on isolated nodes.",
      inputs: ["Transaction Ledgers", "Credit Score Histories", "Market FX Price Lists", "Compliance Regulations"],
      consensus: "Resolves Zero-Knowledge financial transfers and handles multi-party encrypted ledger settlements.",
      coordination: ["Legal Agent", "Insurance Agent"],
      kpis: [
        { label: "False Positive Ratio", value: "0.0001%" },
        { label: "Clearing Speed", value: "110 ms" },
        { label: "Active Nodes", value: "1,940" }
      ],
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5"
    },
    {
      title: "Legal Agent",
      class: "AEGIS-LGL-07",
      icon: Scale,
      desc: "Indexes statutory precedents, checks case citations, and highlights contract clauses to ensure compliance in coordinate events.",
      inputs: ["Civil/Criminal Statutes", "Contract Drafts", "Regulatory compliance guidelines", "Case Precedents"],
      consensus: "Runs cryptographic clause parsing algorithms and audits Proof-of-Consent ledger signatures.",
      coordination: ["Government Agent", "Doctor Agent", "Banking Agent"],
      kpis: [
        { label: "Clause Parsing Accuracy", value: "98.9%" },
        { label: "Verification Latency", value: "160 ms" },
        { label: "Active Nodes", value: "680" }
      ],
      color: "text-purple-400 border-purple-500/20 bg-purple-500/5"
    },
    {
      title: "Manufacturing Agent",
      class: "AEGIS-MFG-08",
      icon: Factory,
      desc: "Predicts assembly machine breakdowns, monitors SCADA systems, and maps logistics lines for institutional factory nodes.",
      inputs: ["Vibration SCADA Sensors", "Temperature Logs", "Vendor Shipments", "Operational Logs"],
      consensus: "Byzantine Fault Tolerant telemetry checks and coordinates multi-node product adaptation pipelines.",
      coordination: ["Supply Chain Agent"],
      kpis: [
        { label: "Downtime Prevention", value: "+28.0%" },
        { label: "Sensor Ping Delay", value: "45 ms" },
        { label: "Active Nodes", value: "1,350" }
      ],
      color: "text-pink-400 border-pink-500/20 bg-pink-500/5"
    },
    {
      title: "Insurance Agent",
      class: "AEGIS-INS-09",
      icon: Heart,
      desc: "Models actuarial risk factors, automates claim filing pipelines, and checks policy limits against coordination ledgers.",
      inputs: ["Actuarial Probability lists", "Claim documents", "Policy boundary parameters", "Property evaluation logs"],
      consensus: "Validates multi-party auto-claim approvals and checks Proof-of-Loss hashes in real time.",
      coordination: ["Banking Agent"],
      kpis: [
        { label: "Automated Payout Rate", value: "92%" },
        { label: "Policy Check Speed", value: "180 ms" },
        { label: "Active Nodes", value: "1,140" }
      ],
      color: "text-rose-400 border-rose-500/20 bg-rose-500/5"
    },
    {
      title: "Supply Chain Agent",
      class: "AEGIS-SCM-10",
      icon: Truck,
      desc: "Balances warehouse stocks, optimizes delivery routes, and tracks global vendor shipping metrics between enterprise nodes.",
      inputs: ["Inventory level data", "Vehicle GPS coordinate feeds", "Global Vendor Invoices", "Shipping Ledgers"],
      consensus: "Decentralized state verification for shipments and registers Proof-of-Delivery smart contracts.",
      coordination: ["Manufacturing Agent"],
      kpis: [
        { label: "Transit Time Savings", value: "18.2%" },
        { label: "Telemetry Update Sync", value: "75 ms" },
        { label: "Active Nodes", value: "2,120" }
      ],
      color: "text-[#4D7CFE] border-[#4D7CFE]/20 bg-[#4D7CFE]/5"
    }
  ];

  const { agents } = useCardContent();
  const agentIcons: Record<string, React.ComponentType<{ className?: string }>> = { "Research Agent": Microscope, "Doctor Agent": Stethoscope, "Education Agent": GraduationCap, "Government Agent": Building, "Agriculture Agent": Shovel, "Banking Agent": Landmark, "Legal Agent": Scale, "Manufacturing Agent": Factory, "Insurance Agent": Heart, "Supply Chain Agent": Truck };
  const agentsData = agents.map((agent) => ({
    ...agent,
    icon: agentIcons[agent.title] || Cpu,
    inputs: agent.inputs.split(",").map((item) => item.trim()).filter(Boolean),
    coordination: agent.coordination.split(",").map((item) => item.trim()).filter(Boolean),
    kpis: agent.kpis.split(";").map((item) => { const [label, value = ""] = item.split("|"); return { label: label.trim(), value: value.trim() }; }),
    color: "text-[#7DD3FC] border-[#4D7CFE]/20 bg-[#4D7CFE]/5",
  }));

  // Filter agents by search term
  const filteredAgents = agentsData.filter(agent => 
    agent.title.toLowerCase().includes(agentSearch.toLowerCase()) ||
    agent.desc.toLowerCase().includes(agentSearch.toLowerCase()) ||
    agent.class.toLowerCase().includes(agentSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white font-body selection:bg-[#4D7CFE]/30 selection:text-white relative overflow-hidden pb-32">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      
      {/* Return to Home Header */}
      <header className="max-w-[80rem] mx-auto w-full px-6 md:px-12 pt-8 flex items-center justify-between relative z-20">
        <Link 
          href="/" 
          className="p-3 border border-white/10 rounded-full bg-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center cursor-pointer"
          title="Return to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="font-heading font-extrabold text-sm tracking-[0.2em] bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
          AEGIS ECOSYSTEM
        </span>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center px-6 md:px-12 pt-16 pb-20 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 uppercase"
          >
            Coordination Consensus Layer
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-tight mb-6"
          >
            Collective Agent <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
              Intelligence
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body text-base md:text-lg text-gray-400 font-light max-w-2xl leading-relaxed mb-12"
          >
            AEGIS provides the secure coordination software layer that connects localized nodes into a unified, private, and highly scalable cooperative network.
          </motion.p>
        </div>

        {/* Dynamic Canvas Centerpiece */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-65 pointer-events-none overflow-hidden">
          <NetworkSphere />
        </div>
      </section>

      {/* Real-time Telemetry Dashboard Row */}
      <section className="max-w-[80rem] mx-auto px-6 md:px-12 pb-16 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-6 flex flex-col gap-2 text-left relative overflow-hidden">
            <span className="font-heading text-[9px] font-extrabold tracking-widest text-gray-500 uppercase">ACTIVE AGENT INSTANCES</span>
            <h3 className="font-heading font-extrabold text-2xl text-[#7DD3FC] tracking-tight">{telemetry.activeAgents.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-500 font-light mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time active nodes
            </p>
          </div>

          <div className="glass-card p-6 flex flex-col gap-2 text-left">
            <span className="font-heading text-[9px] font-extrabold tracking-widest text-gray-500 uppercase">COORDINATED TRANSACTIONS</span>
            <h3 className="font-heading font-extrabold text-2xl text-white tracking-tight">{telemetry.totalTransactions.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-500 font-light mt-1">Accumulated verified state logs</p>
          </div>

          <div className="glass-card p-6 flex flex-col gap-2 text-left">
            <span className="font-heading text-[9px] font-extrabold tracking-widest text-gray-500 uppercase">CONSENSUS VERIFICATION</span>
            <h3 className="font-heading font-extrabold text-2xl text-white tracking-tight">{telemetry.consensusRate}%</h3>
            <p className="text-[10px] text-emerald-400 font-bold mt-1">State ledger sync nominal</p>
          </div>

          <div className="glass-card p-6 flex flex-col gap-2 text-left">
            <span className="font-heading text-[9px] font-extrabold tracking-widest text-gray-500 uppercase">AVG ROUTING LATENCY</span>
            <h3 className="font-heading font-extrabold text-2xl text-[#4D7CFE] tracking-tight">{telemetry.avgLatencyMs} ms</h3>
            <p className="text-[10px] text-gray-500 font-light mt-1">Cross-domain response speed</p>
          </div>
        </div>
      </section>

      {/* Spec Sheet Directory for ALL Agents */}
      <section className="max-w-[80rem] mx-auto px-6 md:px-12 py-20 relative z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-heading text-xs font-bold tracking-[0.2em] text-[#4D7CFE] mb-3 block uppercase">
            Agent Directories
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-white mb-4">
            Specialized Node Specifications
          </h2>
          <p className="font-body text-xs text-gray-400 leading-relaxed font-light">
            Search and expand high-fidelity profiles for all 10 specialized agents to explore input schemas, consensus rules, and verification rates.
          </p>
        </div>

        {/* Search Input bar */}
        <div className="max-w-md mx-auto mb-10 relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-4.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={agentSearch}
            onChange={(e) => {
              setAgentSearch(e.target.value);
              setSelectedAgentIdx(0);
            }}
            placeholder="Search agents by class, utility, or keywords..."
            className="w-full pl-11 pr-5 py-3 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/[0.08] focus:border-[#4D7CFE] text-xs text-white placeholder-gray-500 transition-all outline-none"
          />
        </div>

        {/* Main Spec Directory grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Agent selection list */}
          <div className="lg:col-span-4 flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredAgents.map((agent, index) => {
              const Icon = agent.icon;
              const globalIdx = agentsData.findIndex(a => a.class === agent.class);
              const isSelected = selectedAgentIdx === globalIdx;

              return (
                <button
                  key={agent.class}
                  onClick={() => setSelectedAgentIdx(globalIdx)}
                  className={`w-full text-left p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-[#4D7CFE]/15 border-[#4D7CFE] text-white shadow-sm shadow-[#4D7CFE]/5"
                      : "bg-white/[0.01] border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8.5 h-8.5 rounded-lg border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-[#4d7cfe] text-[#7DD3FC]" : "border-white/10 text-gray-400"
                    } bg-white/5`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-[11px] uppercase tracking-wide">{agent.title}</h4>
                      <p className="font-mono text-[9px] text-gray-500 mt-0.5">{agent.class}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                    isSelected ? "translate-x-0.5 text-[#7DD3FC]" : "text-gray-600"
                  }`} />
                </button>
              );
            })}
            
            {filteredAgents.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-500 font-light border border-white/5 border-dashed rounded-2xl">
                No agents match your query.
              </div>
            )}
          </div>

          {/* Detailed Spec Sheet */}
          <div className="lg:col-span-8">
            {agentsData[selectedAgentIdx] && (
              <div className="glass-card p-8 border border-white/5 text-left relative overflow-hidden flex flex-col gap-6 w-full">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#4D7CFE] to-[#7DD3FC]" />
                
                {/* Spec Sheet Header */}
                <div className="flex justify-between items-start gap-4 pb-5 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[#7DD3FC]">
                      {React.createElement(agentsData[selectedAgentIdx].icon, { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <span className="font-mono text-[9px] font-bold text-gray-500 tracking-wider block">AGENT CLASS SPEC</span>
                      <h3 className="font-heading font-extrabold text-lg text-white tracking-wide uppercase mt-0.5">
                        {agentsData[selectedAgentIdx].title}
                      </h3>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-[#10B981] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase shrink-0">
                    {agentsData[selectedAgentIdx].class}
                  </span>
                </div>

                {/* Spec Description */}
                <div>
                  <span className="font-heading text-[8px] font-extrabold tracking-widest text-[#7DD3FC] uppercase block mb-1">
                    Functionality Descriptor
                  </span>
                  <p className="font-body text-xs text-gray-300 leading-relaxed font-light mt-2">
                    {agentsData[selectedAgentIdx].desc}
                  </p>
                </div>

                {/* Ingest Data Channels & Consensus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <span className="font-heading text-[8px] font-extrabold tracking-widest text-gray-500 uppercase block mb-2">
                      Local Node Ingest Channels
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {agentsData[selectedAgentIdx].inputs.map((inp, i) => (
                        <span key={i} className="text-[10px] font-medium text-gray-400 bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg">
                          {inp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-heading text-[8px] font-extrabold tracking-widest text-gray-500 uppercase block mb-2">
                      Consensus Adaptation Mechanics
                    </span>
                    <p className="font-body text-[11px] text-gray-400 leading-relaxed font-light">
                      {agentsData[selectedAgentIdx].consensus}
                    </p>
                  </div>
                </div>

                {/* Coordination Vectors */}
                <div>
                  <span className="font-heading text-[8px] font-extrabold tracking-widest text-gray-500 uppercase block mb-2.5">
                    Inter-Agent Coordination Vectors
                  </span>
                  <div className="flex flex-wrap gap-3 items-center">
                    {agentsData[selectedAgentIdx].coordination.map((targetAgent, i) => (
                      <div key={i} className="flex items-center gap-2 border border-[#4D7CFE]/20 bg-[#4D7CFE]/5 px-3.5 py-1.5 rounded-xl">
                        <Cpu className="w-3.5 h-3.5 text-[#7DD3FC]" />
                        <span className="font-heading text-[10px] font-bold text-white uppercase tracking-wider">
                          {targetAgent}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="border-t border-white/5 pt-5">
                  <span className="font-heading text-[8px] font-extrabold tracking-widest text-[#7DD3FC] uppercase block mb-3">
                    Node Latency & Performance Indicators
                  </span>
                  <div className="grid grid-cols-3 gap-4">
                    {agentsData[selectedAgentIdx].kpis.map((kpi, i) => (
                      <div key={i} className="bg-white/[0.015] border border-white/[0.04] p-3.5 rounded-xl text-center">
                        <span className="text-[9px] font-medium text-gray-500 uppercase block mb-1">
                          {kpi.label}
                        </span>
                        <span className="font-heading font-extrabold text-sm text-white tracking-tight">
                          {kpi.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Features Overview */}
      <section className="max-w-[80rem] mx-auto px-6 md:px-12 py-10 relative z-10 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 flex flex-col gap-5 text-left">
            <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base tracking-wider uppercase text-white">Context Aggregation</h3>
            <p className="font-body text-xs text-gray-400 leading-relaxed font-light">
              Nodes communicate parameters and semantic data models securely, establishing shared intelligence frameworks without exposing raw proprietary or private data.
            </p>
          </div>

          <div className="glass-card p-8 flex flex-col gap-5 text-left">
            <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base tracking-wider uppercase text-white">Consensus Verification</h3>
            <p className="font-body text-xs text-gray-400 leading-relaxed font-light">
              A cryptographic ledger checks and coordinates state updates across institutional domains, preventing routing loops and unauthorized system commands.
            </p>
          </div>

          <div className="glass-card p-8 flex flex-col gap-5 text-left">
            <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base tracking-wider uppercase text-white">Hierarchical Routing</h3>
            <p className="font-body text-xs text-gray-400 leading-relaxed font-light">
              Decomposes complex requests into atomic sub-tasks. Coordinates local specialized agents in real time, maximizing operational execution and latency speeds.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Simulation */}
      <section className="max-w-[80rem] mx-auto px-6 md:px-12 py-20 relative z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-heading text-xs font-bold tracking-[0.2em] text-[#7DD3FC] mb-3 block uppercase">
            Interactive Telemetry
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-white mb-4">
            Cross-Agent Coordination Pipeline
          </h2>
          <p className="font-body text-xs text-gray-400 leading-relaxed font-light">
            Select a step below to simulate how localized nodes exchange context and verify updates across domains.
          </p>
        </div>

        {/* Workflow Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* List of Steps */}
          <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
            {workflowStages.map((step, idx) => {
              const Icon = step.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeStep === idx
                      ? "bg-[#4D7CFE]/10 border-[#4D7CFE] text-white shadow-md shadow-[#4D7CFE]/5"
                      : "bg-white/[0.01] border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      activeStep === idx ? "border-[#4D7CFE] text-[#7DD3FC]" : "border-white/10 text-gray-400"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xs tracking-wide uppercase">{step.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{step.agent}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                    activeStep === idx ? "rotate-90 text-[#7DD3FC]" : "text-gray-600"
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Interactive Screen Display */}
          <div className="lg:col-span-7">
            <div className="glass-card p-8 border border-white/5 text-left relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4D7CFE]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <span className="font-heading text-[8px] font-extrabold tracking-widest text-[#7DD3FC] uppercase block mb-1">
                  Active Execution Log
                </span>
                
                <h3 className="font-heading font-extrabold text-base text-white tracking-wide uppercase mt-2">
                  {workflowStages[activeStep].agent}
                </h3>
                
                <p className="font-body text-xs text-gray-400 leading-relaxed font-light mt-3">
                  {workflowStages[activeStep].description}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="font-heading text-[8px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                  Consensus Action
                </span>
                <p className="font-mono text-[10.5px] text-[#10B981] font-semibold">
                  &gt; {workflowStages[activeStep].action}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Topology Architecture Graph */}
      <section className="max-w-[80rem] mx-auto px-6 md:px-12 py-20 relative z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-heading text-xs font-bold tracking-[0.2em] text-[#4D7CFE] mb-3 block uppercase">
            System Architecture
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-white mb-4">
            Ecosystem Topology Schema
          </h2>
          <p className="font-body text-xs text-gray-400 leading-relaxed font-light">
            Hover over clusters to highlight active routing channels and consensus paths across network tiers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Topology Interactive Layout */}
          <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-3xl p-10 relative overflow-hidden min-h-[380px] flex flex-col justify-center items-center gap-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(77,124,254,0.03)_0%,transparent_70%)] pointer-events-none" />

            {/* Central Node */}
            <div 
              onMouseEnter={() => setHoveredNode("core")}
              onMouseLeave={() => setHoveredNode(null)}
              className={`px-6 py-3 rounded-xl border font-heading font-bold text-xs tracking-wider uppercase transition-all duration-300 relative z-10 cursor-pointer ${
                hoveredNode === "core" || !hoveredNode
                  ? "bg-[#4D7CFE]/20 border-[#4D7CFE] text-white shadow-[0_0_20px_rgba(77,124,254,0.2)]"
                  : "bg-white/[0.02] border-white/10 text-gray-500"
              }`}
            >
              AEGIS Consensus Core Ledger
            </div>

            {/* Connected lines drawing (visual representation) */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-[#4D7CFE] to-transparent relative z-0" />

            {/* Child Node Layers */}
            <div className="flex flex-col sm:flex-row gap-6 w-full justify-around relative z-10">
              <div 
                onMouseEnter={() => setHoveredNode("research")}
                onMouseLeave={() => setHoveredNode(null)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 w-full sm:w-[30%] cursor-pointer ${
                  hoveredNode === "research"
                    ? "bg-[#7DD3FC]/10 border-[#7DD3FC] text-white shadow-[0_0_15px_rgba(125,211,252,0.15)]"
                    : hoveredNode ? "bg-white/[0.01] border-white/5 opacity-40 text-gray-500" : "bg-white/[0.02] border-white/10 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Microscope className="w-4 h-4 text-[#7DD3FC]" />
                  <h4 className="font-heading font-bold text-[10.5px] uppercase tracking-wider">Research Hub</h4>
                </div>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed">Runs parameter adaptation adaptation streams and updates academic consensus.</p>
              </div>

              <div 
                onMouseEnter={() => setHoveredNode("clinical")}
                onMouseLeave={() => setHoveredNode(null)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 w-full sm:w-[30%] cursor-pointer ${
                  hoveredNode === "clinical"
                    ? "bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : hoveredNode ? "bg-white/[0.01] border-white/5 opacity-40 text-gray-500" : "bg-white/[0.02] border-white/10 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-heading font-bold text-[10.5px] uppercase tracking-wider">Clinical Hub</h4>
                </div>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed">Manages private clinical datasets and executes local symptom tokenization rules.</p>
              </div>

              <div 
                onMouseEnter={() => setHoveredNode("operations")}
                onMouseLeave={() => setHoveredNode(null)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 w-full sm:w-[30%] cursor-pointer ${
                  hoveredNode === "operations"
                    ? "bg-amber-500/10 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : hoveredNode ? "bg-white/[0.01] border-white/5 opacity-40 text-gray-500" : "bg-white/[0.02] border-white/10 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <h4 className="font-heading font-bold text-[10.5px] uppercase tracking-wider">Finance Hub</h4>
                </div>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed">Secures consensus billing channels and verifies API compute settlements.</p>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="lg:col-span-4 text-left flex flex-col gap-6">
            <div>
              <span className="font-heading text-[8px] font-extrabold tracking-widest text-[#7DD3FC] uppercase block mb-1">
                TOPOLOGY HIERARCHY
              </span>
              <h3 className="font-heading font-extrabold text-xl text-white tracking-wide uppercase mt-2">
                Unified Network Routing
              </h3>
              <p className="font-body text-xs text-gray-400 leading-relaxed font-light mt-3">
                Local nodes are grouped into logical domain hubs. Instead of directly querying the global database, request validation is resolved locally first before auditing consensus hashes on the global ledger.
              </p>
            </div>
            
            <div className="border-t border-white/5 pt-5 flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4D7CFE] mt-1.5 shrink-0" />
                <p className="text-[11px] text-gray-400 leading-normal font-light">
                  <strong className="text-white">Low Bandwidth Footprint:</strong> Exchanging vector weights requires only 5% of the bandwidth of raw database copying.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                <p className="text-[11px] text-gray-400 leading-normal font-light">
                  <strong className="text-white">Strict Isolation:</strong> Hub networks prevent data bleed between competing nodes in the same cluster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="max-w-[50rem] mx-auto px-6 md:px-12 py-20 relative z-10 border-t border-white/5">
        <div className="text-center mb-12">
          <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl tracking-tight text-white mb-2">
            Technical Frequently Asked Questions
          </h2>
          <p className="font-body text-xs text-gray-400 leading-relaxed font-light">
            Deep dive into the architecture, consensus parameters, and node operations.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="border border-white/5 rounded-2xl bg-white/[0.01] overflow-hidden transition-all duration-300 text-left"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.01] transition-all"
              >
                <span className="font-heading font-bold text-xs sm:text-sm tracking-wide text-white uppercase">
                  {faq.question}
                </span>
                {openFaq === idx ? (
                  <Minus className="w-4 h-4 text-[#7DD3FC] shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-gray-500 shrink-0" />
                )}
              </button>
              
              <AnimatePresence initial={false}>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="p-5 pt-0 border-t border-white/[0.02] font-body text-xs text-gray-400 leading-relaxed font-light">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
