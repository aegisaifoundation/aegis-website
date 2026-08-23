"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Universe from "@/components/background/Universe";
import MinimalEnding from "@/components/ending/MinimalEnding";
import { 
  ArrowLeft, BookOpen, Calendar, User, Tag, ShieldAlert, Cpu, ArrowRight,
  Terminal as TerminalIcon, ChevronDown, ChevronUp, Play, CheckCircle2, 
  ExternalLink, Globe, Activity, Info, Lock, Shield, Check, HelpCircle, Send, Video 
} from "lucide-react";
import { db } from "@/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { notFound } from "next/navigation";

interface BlockConfig {
  type: "hero" | "terminal" | "grid" | "stats" | "roadmap" | "features" | "comparison" | "contact-form" | "faq" | "rich-text" | "video-hero";
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  badge?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  bodyText?: string;
  paragraphs?: string[];
  
  // Specific configurations
  cards?: { title: string; description: string; badge?: string; link?: string }[];
  stats?: { value: string; label: string; subtext?: string }[];
  roadmapItems?: { title: string; desc: string; status: "active" | "completed" | "planned" }[];
  commands?: { cmd: string; output: string }[];
  featuresList?: { title: string; description: string }[];
  comparisonTiers?: { name: string; specs: { label: string; value: string }[]; featured?: boolean; ctaText?: string; ctaLink?: string }[];
  faqItems?: { question: string; answer: string }[];
  
  // Media / Form
  mediaUrl?: string;
  formTitle?: string;
  formEnabled?: boolean;
}

interface PageConfig {
  id: string;
  title: string;
  description: string;
  template: "publication" | "grid" | "canvas" | "modular";
  authors?: string;
  category?: string;
  date?: string;
  abstract?: string;
  bodyParagraphs?: string[];
  cards?: { title: string; description: string; badge?: string; link?: string }[];
  formEnabled?: boolean;
  formTitle?: string;
  blocks?: BlockConfig[];
}

export default function DynamicCustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [page, setPage] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  // Form states inside legacy custom contact form
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Modular components interactive states
  const [activeCommands, setActiveCommands] = useState<Record<number, string>>({});
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});
  const [formSubmissions, setFormSubmissions] = useState<Record<number, boolean>>({});
  const [modFormName, setModFormName] = useState("");
  const [modFormEmail, setModFormEmail] = useState("");
  const [modFormMsg, setModFormMsg] = useState("");

  useEffect(() => {
    const docRef = doc(db, "website_pages", slug);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setPage({ id: docSnap.id, ...docSnap.data() } as PageConfig);
          setNotFoundState(false);
        } else {
          setPage(null);
          setNotFoundState(true);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load page config:", err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [slug]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormName("");
    setFormEmail("");
    setFormMsg("");
  };

  const handleModularFormSubmit = (e: React.FormEvent, blockIdx: number) => {
    e.preventDefault();
    setFormSubmissions((prev) => ({ ...prev, [blockIdx]: true }));
    setModFormName("");
    setModFormEmail("");
    setModFormMsg("");
  };

  const toggleFaq = (faqKey: string) => {
    setOpenFaqs((prev) => ({ ...prev, [faqKey]: !prev[faqKey] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
        <div className="animate-pulse">Loading secure page capsule...</div>
      </div>
    );
  }

  if (notFoundState || !page) {
    return notFound();
  }

  return (
    <div className="relative min-h-screen bg-black text-white font-body selection:bg-[#4D7CFE] selection:text-white">
      <Universe />
      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-32 pb-24 flex flex-col gap-10">
        
        {/* Back Link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white tracking-widest uppercase transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        {/* 1. Publication Template */}
        {page.template === "publication" && (
          <article className="glass-card p-8 md:p-12 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#7DD3FC] border-b border-white/5 pb-4">
              <span>{page.category || "Research Paper"}</span>
              <span className="font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {page.date || new Date().toLocaleDateString()}
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl leading-snug text-white">
              {page.title}
            </h1>

            {page.authors && (
              <div className="flex items-center gap-2 text-xs text-gray-300 font-semibold border-b border-white/5 pb-6">
                <User className="w-4 h-4 text-gray-400" />
                <span>Authors: {page.authors}</span>
              </div>
            )}

            {page.abstract && (
              <div className="flex flex-col gap-3 p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7DD3FC] flex items-center gap-1.5 font-heading">
                  <BookOpen className="w-3.5 h-3.5" /> Abstract
                </span>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  {page.abstract}
                </p>
              </div>
            )}

            {page.bodyParagraphs && page.bodyParagraphs.map((para, idx) => (
              <p key={idx} className="text-sm text-gray-300 leading-relaxed font-light mt-2">
                {para}
              </p>
            ))}
          </article>
        )}

        {/* 2. Feature Showcase Grid Template */}
        {page.template === "grid" && (
          <div className="flex flex-col gap-10 w-full">
            <header className="text-center max-w-3xl mx-auto flex flex-col gap-3">
              <span className="text-xs font-bold text-[#7DD3FC] uppercase tracking-[0.2em] font-heading">
                {page.category || "Solutions Catalog"}
              </span>
              <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white tracking-tight">
                {page.title}
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                {page.description}
              </p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {page.cards && page.cards.map((card, idx) => (
                <div 
                  key={idx} 
                  className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col justify-between gap-6 hover:border-white/10 transition-all hover:bg-white/[0.02] group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-[#7DD3FC]">
                        <Cpu className="w-5 h-5" />
                      </div>
                      {card.badge && (
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded border border-white/10 text-gray-400 bg-white/5 uppercase tracking-wider">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-base font-heading mt-2 group-hover:text-[#7DD3FC] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">
                      {card.description}
                    </p>
                  </div>

                  {card.link && (
                    <Link 
                      href={card.link}
                      className="text-[10px] font-bold text-[#4D7CFE] hover:text-[#7DD3FC] flex items-center gap-1.5 uppercase tracking-wider self-start mt-2 transition-colors"
                    >
                      Explore Space <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Canvas Landing Template */}
        {page.template === "canvas" && (
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 w-full max-w-5xl mx-auto items-start">
            <div className="flex flex-col gap-6">
              <header className="flex flex-col gap-2">
                <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                  {page.title}
                </h1>
                <p className="text-sm text-[#7DD3FC] font-semibold leading-relaxed">
                  {page.description}
                </p>
              </header>

              <div className="flex flex-col gap-4 mt-2">
                {page.bodyParagraphs && page.bodyParagraphs.map((para, idx) => (
                  <p key={idx} className="text-sm text-gray-300 leading-relaxed font-light">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {page.formEnabled && (
              <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 bg-[#030712]/40 flex flex-col gap-4 w-full">
                <h2 className="font-heading font-bold text-lg text-white">
                  {page.formTitle || "Initiate Query Portal"}
                </h2>
                
                {formSubmitted ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center flex flex-col gap-2">
                    <span className="text-xs font-bold text-emerald-400">Request Dispatched!</span>
                    <p className="text-[10px] text-gray-400">The AEGIS operations module will synchronize parameters shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                    <input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Name"
                      className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-[#4D7CFE] text-xs text-white"
                      required
                    />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="Email"
                      className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-[#4D7CFE] text-xs text-white"
                      required
                    />
                    <textarea
                      value={formMsg}
                      onChange={(e) => setFormMsg(e.target.value)}
                      placeholder="Message Specifications"
                      rows={4}
                      className="rounded-lg bg-white/5 border border-white/10 p-4 outline-none focus:border-[#4D7CFE] text-xs text-white leading-relaxed resize-none"
                      required
                    />
                    <button className="rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer">
                      SUBMIT REQUEST
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. Modular Block Builder Engine */}
        {page.template === "modular" && (
          <div className="flex flex-col gap-24 w-full mt-4">
            {page.blocks && page.blocks.map((block, idx) => {
              switch (block.type) {
                
                // 1. Hero Block
                case "hero":
                  return (
                    <section key={idx} className="relative py-12 flex flex-col items-center text-center gap-6 max-w-4xl mx-auto w-full">
                      {block.badge && (
                        <span className="text-[10px] font-bold text-[#7DD3FC] px-3 py-1 rounded-full border border-[#7DD3FC]/20 bg-[#7DD3FC]/5 uppercase tracking-widest animate-pulse">
                          {block.badge}
                        </span>
                      )}
                      <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                        {block.title}
                      </h1>
                      {block.description && (
                        <p className="text-sm md:text-base text-gray-400 max-w-2xl font-light leading-relaxed">
                          {block.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 justify-center mt-4">
                        {block.primaryBtnText && block.primaryBtnLink && (
                          <Link 
                            href={block.primaryBtnLink}
                            className="bg-[#4D7CFE] hover:bg-[#3b66d9] text-white px-6 py-3 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)]"
                          >
                            {block.primaryBtnText}
                          </Link>
                        )}
                        {block.secondaryBtnText && block.secondaryBtnLink && (
                          <Link 
                            href={block.secondaryBtnLink}
                            className="border border-white/10 hover:border-white/20 hover:bg-white/5 text-white px-6 py-3 rounded-lg text-xs font-bold transition-all"
                          >
                            {block.secondaryBtnText}
                          </Link>
                        )}
                      </div>
                    </section>
                  );

                // 2. Terminal Console Block
                case "terminal":
                  const currentCmd = activeCommands[idx] || "";
                  const matchingCmdObj = block.commands?.find(c => c.cmd === currentCmd);
                  const consoleOutput = matchingCmdObj ? matchingCmdObj.output : "Click a command below to verify parameters.";

                  return (
                    <section key={idx} className="glass-card max-w-3xl mx-auto w-full border border-white/10 bg-[#030712]/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                      {/* Window header bar */}
                      <div className="bg-white/[0.03] px-4 py-3 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                          <TerminalIcon className="w-3.5 h-3.5" /> {block.title || "Secure CLI Console"}
                        </span>
                        <span className="w-8" />
                      </div>

                      {/* Display panel */}
                      <div className="p-5 min-h-[160px] font-mono text-xs text-green-400 bg-black flex flex-col gap-2 select-text whitespace-pre-line leading-relaxed">
                        <div className="text-gray-500">// AEGIS Secure Enclave Console Node</div>
                        <div>$ {currentCmd || "aegis --help"}</div>
                        <div className="text-gray-300 mt-1">{consoleOutput}</div>
                      </div>

                      {/* Control commands list */}
                      <div className="p-4 bg-white/[0.01] border-t border-white/5 flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase mr-1">Directives:</span>
                        {block.commands && block.commands.map((cmdObj, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => setActiveCommands(prev => ({ ...prev, [idx]: cmdObj.cmd }))}
                            className={`px-3 py-1.5 rounded bg-white/5 border text-[10px] font-mono transition-all cursor-pointer ${
                              currentCmd === cmdObj.cmd ? "border-green-500/50 text-green-400" : "border-white/10 text-gray-400 hover:text-white"
                            }`}
                          >
                            {cmdObj.cmd}
                          </button>
                        ))}
                      </div>
                    </section>
                  );

                // 3. Showcase Grid Block
                case "grid":
                  return (
                    <section key={idx} className="flex flex-col gap-6 w-full">
                      {block.title && (
                        <h2 className="font-heading font-extrabold text-xl md:text-2xl text-white tracking-tight border-b border-white/5 pb-2">
                          {block.title}
                        </h2>
                      )}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {block.cards && block.cards.map((card, cIdx) => (
                          <div 
                            key={cIdx} 
                            className="glass-card p-6 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col justify-between gap-6 hover:border-white/10 transition-all hover:bg-white/[0.02] group"
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-[#7DD3FC]">
                                  <Cpu className="w-5 h-5" />
                                </div>
                                {card.badge && (
                                  <span className="text-[8px] font-bold px-2 py-0.5 rounded border border-white/10 text-gray-400 bg-white/5 uppercase tracking-wider">
                                    {card.badge}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-white text-sm font-heading mt-1 group-hover:text-[#7DD3FC] transition-colors">
                                {card.title}
                              </h3>
                              <p className="text-xs text-gray-400 leading-relaxed font-light">
                                {card.description}
                              </p>
                            </div>

                            {card.link && (
                              <Link 
                                href={card.link}
                                className="text-[9px] font-bold text-[#4D7CFE] hover:text-[#7DD3FC] flex items-center gap-1.5 uppercase tracking-wider self-start transition-colors"
                              >
                                Learn More <ArrowRight className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );

                // 4. Statistics Block
                case "stats":
                  return (
                    <section key={idx} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                      {block.stats && block.stats.map((stat, sIdx) => (
                        <div key={sIdx} className="glass-card p-5 border border-white/5 bg-white/[0.01] rounded-xl text-center flex flex-col gap-1.5">
                          <span className="font-heading font-extrabold text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#7DD3FC]">
                            {stat.value}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                            {stat.label}
                          </span>
                          {stat.subtext && (
                            <span className="text-[9px] text-gray-500 font-light">
                              {stat.subtext}
                            </span>
                          )}
                        </div>
                      ))}
                    </section>
                  );

                // 5. Roadmap Timeline Block
                case "roadmap":
                  return (
                    <section key={idx} className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
                      {block.title && (
                        <h2 className="font-heading font-extrabold text-xl md:text-2xl text-white tracking-tight border-b border-white/5 pb-2">
                          {block.title}
                        </h2>
                      )}
                      <div className="relative pl-6 border-l border-white/10 flex flex-col gap-8">
                        {block.roadmapItems && block.roadmapItems.map((item, rIdx) => {
                          const isCompleted = item.status === "completed";
                          const isActive = item.status === "active";
                          
                          return (
                            <div key={rIdx} className="relative flex flex-col md:flex-row gap-4 items-start">
                              {/* Glowing timeline node */}
                              <span className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-2 bg-black transition-all ${
                                isCompleted ? "border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                isActive ? "border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" :
                                "border-white/20"
                              }`} />

                              <div className="flex-1 flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-heading font-bold text-sm text-white">
                                    {item.title}
                                  </h3>
                                  <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    isCompleted ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                    isActive ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                    "bg-white/5 text-gray-400 border-white/10"
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed font-light">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );

                // 6. Showcase Features (Split Layout) Block
                case "features":
                  return (
                    <section key={idx} className="grid lg:grid-cols-2 gap-10 items-center w-full">
                      <div className="flex flex-col gap-5">
                        {block.badge && (
                          <span className="text-[9px] font-bold uppercase text-[#7DD3FC] tracking-widest">{block.badge}</span>
                        )}
                        <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-white tracking-tight leading-tight">
                          {block.title}
                        </h2>
                        {block.description && (
                          <p className="text-xs text-gray-400 leading-relaxed font-light">
                            {block.description}
                          </p>
                        )}
                        {block.featuresList && (
                          <div className="flex flex-col gap-3 mt-2">
                            {block.featuresList.map((f, fIdx) => (
                              <div key={fIdx} className="flex gap-2 items-start">
                                <div className="p-1 rounded bg-[#7DD3FC]/10 text-[#7DD3FC] mt-0.5">
                                  <Check className="w-3 h-3" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white">{f.title}</h4>
                                  <p className="text-[11px] text-gray-500 font-light mt-0.5 leading-relaxed">{f.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Glowing Cyber Visual container */}
                      <div className="relative glass-card border border-white/10 bg-[#030712]/50 p-8 rounded-2xl h-64 overflow-hidden flex items-center justify-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full filter blur-2xl animate-pulse" />
                        <div className="relative border border-white/10 rounded-xl p-4 bg-black/60 flex flex-col gap-2 items-center text-center max-w-[200px]">
                          <Cpu className="w-8 h-8 text-[#7DD3FC] animate-spin" style={{ animationDuration: '6s' }} />
                          <span className="text-[10px] font-mono text-gray-400">Microkernel System</span>
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Operational</span>
                        </div>
                      </div>
                    </section>
                  );

                // 7. Comparison Block
                case "comparison":
                  return (
                    <section key={idx} className="flex flex-col gap-8 w-full">
                      {block.title && (
                        <h2 className="font-heading font-extrabold text-xl md:text-2xl text-white tracking-tight border-b border-white/5 pb-2">
                          {block.title}
                        </h2>
                      )}
                      <div className="grid md:grid-cols-3 gap-6">
                        {block.comparisonTiers && block.comparisonTiers.map((tier, tIdx) => (
                          <div 
                            key={tIdx} 
                            className={`glass-card p-6 rounded-2xl border flex flex-col justify-between gap-6 transition-all ${
                              tier.featured 
                                ? "border-blue-500 bg-blue-950/[0.05] shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-105" 
                                : "border-white/5 bg-white/[0.01]"
                            }`}
                          >
                            <div className="flex flex-col gap-4">
                              <h3 className="font-heading font-bold text-base text-white">
                                {tier.name}
                              </h3>
                              <div className="border-t border-white/5 pt-4 flex flex-col gap-2.5">
                                {tier.specs && tier.specs.map((spec, sIdx) => (
                                  <div key={sIdx} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-light">{spec.label}</span>
                                    <span className="text-gray-300 font-mono font-medium">{spec.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {tier.ctaText && tier.ctaLink && (
                              <Link 
                                href={tier.ctaLink}
                                className={`text-center py-2.5 rounded-lg text-xs font-bold transition-all ${
                                  tier.featured 
                                    ? "bg-[#4D7CFE] hover:bg-[#3b66d9] text-white" 
                                    : "border border-white/10 hover:border-white/20 hover:bg-white/5 text-white"
                                }`}
                              >
                                {tier.ctaText}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );

                // 8. Lead/Query Capture Form Block
                case "contact-form":
                  const isSubmitted = formSubmissions[idx];

                  return (
                    <section key={idx} className="glass-card max-w-lg mx-auto w-full p-6 md:p-8 rounded-2xl border border-white/5 bg-[#030712]/40 flex flex-col gap-4">
                      <h2 className="font-heading font-bold text-lg text-white">
                        {block.formTitle || "Initiate Contact Protocol"}
                      </h2>
                      {block.description && (
                        <p className="text-xs text-gray-400 leading-relaxed font-light mb-1">
                          {block.description}
                        </p>
                      )}
                      
                      {isSubmitted ? (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center flex flex-col gap-2 animate-fade-in">
                          <span className="text-xs font-bold text-emerald-400">Payload Dispatched!</span>
                          <p className="text-[10px] text-gray-500 leading-normal">Operational registers updated. The system agent will handle parameters shortly.</p>
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleModularFormSubmit(e, idx)} className="flex flex-col gap-4">
                          <input
                            value={modFormName}
                            onChange={(e) => setModFormName(e.target.value)}
                            placeholder="Name"
                            className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-[#4D7CFE] text-xs text-white"
                            required
                          />
                          <input
                            type="email"
                            value={modFormEmail}
                            onChange={(e) => setModFormEmail(e.target.value)}
                            placeholder="Email"
                            className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-[#4D7CFE] text-xs text-white"
                            required
                          />
                          <textarea
                            value={modFormMsg}
                            onChange={(e) => setModFormMsg(e.target.value)}
                            placeholder="Message Specifications..."
                            rows={4}
                            className="rounded-lg bg-white/5 border border-white/10 p-4 outline-none focus:border-[#4D7CFE] text-xs text-white leading-relaxed resize-none"
                            required
                          />
                          <button className="rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer flex items-center justify-center gap-1.5">
                            <Send className="w-3.5 h-3.5" /> SUBMIT SPECIFICATION
                          </button>
                        </form>
                      )}
                    </section>
                  );

                // 9. FAQ Accordion Block
                case "faq":
                  return (
                    <section key={idx} className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
                      {block.title && (
                        <h2 className="font-heading font-extrabold text-xl md:text-2xl text-white tracking-tight border-b border-white/5 pb-2">
                          {block.title}
                        </h2>
                      )}
                      <div className="flex flex-col gap-3">
                        {block.faqItems && block.faqItems.map((faq, fIdx) => {
                          const faqKey = `${idx}-${fIdx}`;
                          const isOpen = openFaqs[faqKey];

                          return (
                            <div key={fIdx} className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden">
                              <button
                                onClick={() => toggleFaq(faqKey)}
                                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-xs font-semibold text-white hover:text-[#7DD3FC] transition-colors cursor-pointer"
                              >
                                <span>{faq.question}</span>
                                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                              </button>
                              
                              {isOpen && (
                                <div className="px-5 pb-4 text-xs text-gray-400 font-light leading-relaxed border-t border-white/5 pt-3 bg-white/[0.005] animate-fade-in">
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );

                // 10. Rich Text Block
                case "rich-text":
                  return (
                    <section key={idx} className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 max-w-4xl mx-auto w-full">
                      {block.title && (
                        <h2 className="font-heading font-extrabold text-lg text-white border-b border-white/5 pb-2">
                          {block.title}
                        </h2>
                      )}
                      {block.subtitle && (
                        <h3 className="text-xs font-bold text-[#7DD3FC] uppercase tracking-wider">
                          {block.subtitle}
                        </h3>
                      )}
                      {block.paragraphs && block.paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                          {para}
                        </p>
                      ))}
                      {block.bodyText && (
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light whitespace-pre-wrap">
                          {block.bodyText}
                        </p>
                      )}
                    </section>
                  );

                // 11. Cinematic Media Hero Block
                case "video-hero":
                  return (
                    <section key={idx} className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#030712] aspect-video max-w-4xl mx-auto flex items-center justify-center">
                      {/* Fake video placeholder */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 z-20 gap-2">
                        {block.badge && (
                          <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest self-start px-2 py-0.5 border border-blue-500/20 bg-blue-500/10 rounded">
                            {block.badge}
                          </span>
                        )}
                        <h2 className="font-heading font-extrabold text-xl md:text-3xl text-white tracking-tight">
                          {block.title}
                        </h2>
                        {block.description && (
                          <p className="text-[11px] md:text-xs text-gray-400 font-light max-w-lg leading-relaxed">
                            {block.description}
                          </p>
                        )}
                      </div>
                      <div className="relative z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer shadow-lg transition-transform hover:scale-105">
                        <Video className="w-8 h-8 text-[#7DD3FC]" />
                      </div>
                    </section>
                  );

                default:
                  return null;
              }
            })}
          </div>
        )}
      </main>

      <MinimalEnding />
    </div>
  );
}

