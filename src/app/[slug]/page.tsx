"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Universe from "@/components/background/Universe";
import MinimalEnding from "@/components/ending/MinimalEnding";
import { ArrowLeft, BookOpen, Calendar, User, Tag, ShieldAlert, Cpu, ArrowRight } from "lucide-react";
import { db } from "@/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { notFound } from "next/navigation";

interface PageConfig {
  id: string;
  title: string;
  description: string;
  template: "publication" | "grid" | "canvas";
  authors?: string;
  category?: string;
  date?: string;
  abstract?: string;
  bodyParagraphs?: string[];
  cards?: { title: string; description: string; badge?: string; link?: string }[];
  formEnabled?: boolean;
  formTitle?: string;
}

export default function DynamicCustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [page, setPage] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  // Form states inside custom contact form
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

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
      </main>

      <MinimalEnding />
    </div>
  );
}
