"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  ShieldAlert,
  Cpu,
  ChevronRight,
  RotateCcw,
  Zap,
  Lock,
  Globe,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LogEntry {
  id: number;
  phase: "plan" | "exec" | "audit" | "done" | "error";
  text: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PHASE_COLORS: Record<LogEntry["phase"], string> = {
  plan:  "text-blue-400",
  exec:  "text-emerald-400",
  audit: "text-amber-400",
  done:  "text-[#7DD3FC]",
  error: "text-red-400",
};

const PHASE_LABELS: Record<LogEntry["phase"], string> = {
  plan:  "PLAN",
  exec:  "EXEC",
  audit: "AUDIT",
  done:  "DONE",
  error: "ERR ",
};

/** Sequences for different query types */
const LOG_SEQUENCES: Record<"normal" | "privacy", LogEntry[]> = {
  normal: [
    { id: 1,  phase: "plan",  text: "Parsing intent and building task graph..." },
    { id: 2,  phase: "plan",  text: "Selecting optimal local model (llama-3-8b-instruct)" },
    { id: 3,  phase: "exec",  text: "Routing inference to local CUDA engine (GPU: RTX 4080)" },
    { id: 4,  phase: "exec",  text: "Executing tool: web_search(query='federated learning benchmarks')" },
    { id: 5,  phase: "exec",  text: "Sub-agent delegated: Researcher → summarize findings" },
    { id: 6,  phase: "exec",  text: "Sub-agent delegated: Critic → validate factual accuracy" },
    { id: 7,  phase: "audit", text: "Computing homomorphic validation hash for output..." },
    { id: 8,  phase: "audit", text: "Proof-of-Execution ledger signed (block #48291)" },
    { id: 9,  phase: "done",  text: "Response ready — zero raw data transmitted to network ✓" },
  ],
  privacy: [
    { id: 1,  phase: "plan",  text: "Parsing intent and building task graph..." },
    { id: 2,  phase: "error", text: "PRIVACY GUARD: Detected potential API key pattern in input (sk-...)" },
    { id: 3,  phase: "error", text: "PRIVACY GUARD: Halting external routing — activating local-only mode" },
    { id: 4,  phase: "audit", text: "Redacting sensitive token from prompt context buffer..." },
    { id: 5,  phase: "audit", text: "PII scrubbing applied. Sanitized payload committed to memory." },
    { id: 6,  phase: "exec",  text: "Resuming with sanitized prompt on local llama-3-8b-instruct" },
    { id: 7,  phase: "done",  text: "Execution complete — sensitive token never left device ✓" },
  ],
};

/** Prompts that trigger the privacy guard */
const PRIVACY_TRIGGERS = ["sk-", "api_key", "password", "secret", "token=", "bearer "];

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function detectPrivacy(text: string): boolean {
  const lower = text.toLowerCase();
  return PRIVACY_TRIGGERS.some((t) => lower.includes(t));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SandboxSimulator() {
  const [model, setModel] = useState<"local" | "remote">("local");
  const [inputValue, setInputValue] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [showPrivacyAlert, setShowPrivacyAlert] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const logsEndRef = useRef<HTMLDivElement>(null);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, streamingText]);

  // Clear all timers on unmount
  useEffect(() => () => { timerRefs.current.forEach(clearTimeout); }, []);

  const clearTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };

  const runSimulation = useCallback((isPrivacy: boolean) => {
    clearTimers();
    const sequence = isPrivacy ? LOG_SEQUENCES.privacy : LOG_SEQUENCES.normal;
    setLogs([]);
    setStreamingText("");
    setRunning(true);
    setSubmitted(true);

    sequence.forEach((entry, i) => {
      const t = setTimeout(() => {
        setLogs((prev) => [...prev, entry]);
        if (i === sequence.length - 1) {
          // Stream "response" text after final log
          const response = isPrivacy
            ? "Your sensitive input was intercepted and sanitized locally. The token was never transmitted. Re-enter a safe query to proceed."
            : "Federated learning enables distributed model training while keeping raw data local. Benchmark studies show FedAvg converges within 5-8% of centralized performance on heterogeneous data across 100+ nodes.";
          let idx = 0;
          const stream = () => {
            setStreamingText(response.slice(0, idx + 1));
            idx++;
            if (idx < response.length) {
              const st = setTimeout(stream, 12);
              timerRefs.current.push(st);
            } else {
              setRunning(false);
            }
          };
          const st = setTimeout(stream, 400);
          timerRefs.current.push(st);
        }
      }, i * 420 + 300);
      timerRefs.current.push(t);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || running) return;

    const isPrivacy = detectPrivacy(inputValue);
    setShowPrivacyAlert(isPrivacy);
    runSimulation(isPrivacy);
  };

  const handleReset = () => {
    clearTimers();
    setLogs([]);
    setStreamingText("");
    setRunning(false);
    setSubmitted(false);
    setShowPrivacyAlert(false);
    setInputValue("");
  };

  const handleExamplePrompt = (prompt: string) => {
    if (running) return;
    setInputValue(prompt);
    const isPrivacy = detectPrivacy(prompt);
    setShowPrivacyAlert(isPrivacy);
    runSimulation(isPrivacy);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <section
      id="sandbox"
      className="relative py-32 md:py-40 flex flex-col items-center justify-center bg-transparent border-b border-white/5 overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(77,124,254,0.04)_0%,transparent_65%)] pointer-events-none" />

      <div className="max-w-[1100px] mx-auto w-full px-6 md:px-12 relative z-10 flex flex-col items-center gap-12">

        {/* ── Header ── */}
        <div className="text-center max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.35em] text-[#4D7CFE] mb-3 block uppercase"
          >
            INTERACTIVE PREVIEW
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-5 leading-tight"
          >
            The AEGIS<br className="hidden sm:block" /> Workspace Simulator
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="font-body text-sm text-gray-400 font-light leading-relaxed"
          >
            Experience the live agent reasoning pipeline — prompt trace logs, privacy guard intercepts,
            and zero-data-leakage guarantees, all running locally on your node.
          </motion.p>
        </div>

        {/* ── Example Prompt Pills ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.22 }}
          className="flex flex-wrap justify-center gap-2.5"
        >
          {[
            { label: "Summarize federated learning benchmarks", privacy: false },
            { label: "sk-1234567890abcdef (API key test)", privacy: true },
            { label: "Explain AEGIS homomorphic aggregation", privacy: false },
            { label: "token=eyJhbGciOi... (Bearer test)", privacy: true },
          ].map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExamplePrompt(ex.label)}
              disabled={running}
              className={`px-3.5 py-1.5 rounded-full border text-[10px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 ${
                ex.privacy
                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                  : "border-[#4D7CFE]/30 text-[#7DD3FC] hover:bg-[#4D7CFE]/10"
              }`}
            >
              {ex.privacy && <ShieldAlert className="inline w-3 h-3 mr-1 -mt-0.5" />}
              {ex.label}
            </button>
          ))}
        </motion.div>

        {/* ── Main Simulator Window ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="w-full rounded-2xl border border-white/8 bg-[#030712] overflow-hidden shadow-2xl shadow-black/60"
        >
          {/* Window Title Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-[#050d1a]">
            <div className="flex items-center gap-2.5">
              {/* Traffic lights */}
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">
              AEGIS WORKSPACE — LOCAL NODE SESSION
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                NODE ACTIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] divide-y lg:divide-y-0 lg:divide-x divide-white/5">

            {/* ── Left: Chat Panel ── */}
            <div className="flex flex-col min-h-[480px]">
              {/* Model Toggle */}
              <div className="flex items-center gap-3 px-6 py-3.5 border-b border-white/5 bg-black/30">
                <span className="text-[9px] font-heading font-bold text-gray-500 uppercase tracking-widest">
                  Inference Backend
                </span>
                <div className="flex gap-1.5 ml-auto">
                  <button
                    onClick={() => setModel("local")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                      model === "local"
                        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <Cpu className="w-3 h-3" /> Local Llama
                  </button>
                  <button
                    onClick={() => setModel("remote")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                      model === "remote"
                        ? "bg-blue-500/20 border border-blue-500/40 text-blue-400"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <Globe className="w-3 h-3" /> Remote GPT
                    {model === "remote" && (
                      <span className="ml-0.5 text-[7px] border border-amber-500/40 text-amber-400 px-1 rounded">
                        ENCRYPTED
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 px-6 py-6 flex flex-col gap-5 overflow-y-auto max-h-[300px] custom-scrollbar">
                {!submitted ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <div className="w-10 h-10 rounded-xl border border-white/8 bg-white/[0.03] text-[#7DD3FC] flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 font-light max-w-xs leading-relaxed">
                      Type a prompt below or click one of the example pills above to start a simulated inference session.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* User message bubble */}
                    <div className="flex gap-3 justify-end">
                      <div className="bg-[#4D7CFE]/15 border border-[#4D7CFE]/20 text-white text-[11.5px] rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%] leading-relaxed font-light">
                        {inputValue}
                      </div>
                    </div>

                    {/* Privacy guard alert bubble */}
                    <AnimatePresence>
                      {showPrivacyAlert && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="flex gap-3 items-start"
                        >
                          <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                          <div className="bg-red-500/8 border border-red-500/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                            <p className="text-[10px] font-heading font-extrabold text-red-400 uppercase tracking-widest mb-1">
                              PRIVACY GUARD ACTIVATED
                            </p>
                            <p className="text-[11px] text-red-300/80 font-light leading-relaxed">
                              Sensitive credential pattern detected in your prompt.
                              External routing has been blocked. Redacting and sanitizing locally…
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Agent response bubble */}
                    {streamingText && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 items-start"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#4D7CFE]/15 border border-[#4D7CFE]/30 text-[#7DD3FC] flex items-center justify-center shrink-0 mt-0.5">
                          <Cpu className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                          <p className="text-[11.5px] text-gray-300 font-light leading-relaxed">
                            {streamingText}
                            {running && (
                              <span className="inline-block w-1.5 h-3.5 bg-[#7DD3FC] ml-0.5 align-middle animate-pulse rounded-sm" />
                            )}
                          </p>
                          {!running && streamingText && (
                            <div className="flex items-center gap-1.5 mt-2.5 text-[9px] text-emerald-400 font-bold">
                              <Check className="w-3 h-3" />
                              ZERO DATA TRANSMITTED — LOCAL EXECUTION CONFIRMED
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* Input Bar */}
              <div className="px-5 py-4 border-t border-white/5 bg-black/20">
                <form onSubmit={handleSubmit} className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    {showPrivacyAlert && !running && (
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-400" />
                    )}
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        if (!running) {
                          setShowPrivacyAlert(detectPrivacy(e.target.value));
                        }
                      }}
                      placeholder="Enter a prompt…"
                      disabled={running}
                      className={`w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-xs text-white outline-none transition-all disabled:opacity-50 ${
                        showPrivacyAlert
                          ? "border-red-500/40 focus:border-red-500/70 pl-9"
                          : "border-white/8 focus:border-[#4D7CFE]/60"
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={running || !inputValue.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#4D7CFE] hover:bg-[#3b66d9] text-[10px] font-bold uppercase tracking-widest text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Reset session"
                    className="p-2.5 rounded-xl border border-white/8 text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* ── Right: Tool Log Terminal ── */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-[#050d1a]">
                <Terminal className="w-3.5 h-3.5 text-[#7DD3FC]" />
                <span className="font-heading text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                  Reasoning Trace Log
                </span>
                {running && (
                  <span className="ml-auto flex items-center gap-1 text-[8px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE
                  </span>
                )}
              </div>

              <div className="flex-1 font-mono text-[10px] leading-relaxed p-5 overflow-y-auto max-h-[420px] bg-black/50 custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                    <Terminal className="w-8 h-8 text-gray-700" />
                    <p className="text-gray-600 text-[10px]">
                      Submit a prompt to see<br />the reasoning trace stream.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {logs.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2"
                      >
                        <span className={`shrink-0 font-extrabold ${PHASE_COLORS[entry.phase]}`}>
                          [{PHASE_LABELS[entry.phase]}]
                        </span>
                        <span className="text-gray-400">{entry.text}</span>
                      </motion.div>
                    ))}
                    {running && logs.length > 0 && (
                      <div className="flex gap-2 text-gray-600 animate-pulse">
                        <span>[    ]</span>
                        <span>Processing…</span>
                      </div>
                    )}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>

              {/* Stats Footer */}
              <div className="px-5 py-3.5 border-t border-white/5 bg-[#050d1a] grid grid-cols-2 gap-x-4 gap-y-1">
                {[
                  { label: "Backend", value: model === "local" ? "Llama-3-8B · Local" : "GPT-4o · Encrypted" },
                  { label: "Privacy", value: showPrivacyAlert ? "GUARD ACTIVE" : "Nominal" },
                  { label: "Data transmitted", value: "0 bytes" },
                  { label: "Execution", value: running ? "Running…" : logs.length > 0 ? "Completed" : "Idle" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-[8px] text-gray-600 font-heading font-bold uppercase tracking-widest">
                      {stat.label}
                    </span>
                    <span className={`text-[9px] font-mono font-bold ${
                      stat.label === "Privacy" && showPrivacyAlert ? "text-red-400" : "text-gray-300"
                    }`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-[10px] text-gray-600 font-light max-w-xl"
        >
          Simulated environment only. No real network requests are made. In production, the AEGIS Kernel
          routes all executions through local CUDA or CPU backends with cryptographic audit trails.
        </motion.p>
      </div>
    </section>
  );
}
