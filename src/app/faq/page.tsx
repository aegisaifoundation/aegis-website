"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Universe from "@/components/background/Universe";
import MinimalEnding from "@/components/ending/MinimalEnding";
import { ArrowLeft, BookOpen, Search, Plus, Minus, HelpCircle } from "lucide-react";

import { useCardContent } from "@/config/cardContent";

export default function TechnicalFAQPage() {
  const { websiteFaqs = [] } = useCardContent();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = ["ALL", "Microkernel", "Swarm", "Network", "System Specs"];

  const filteredEntries = websiteFaqs.filter((entry) => {
    const matchesSearch =
      entry.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen bg-black text-white font-body selection:bg-[#4D7CFE] selection:text-white">
      {/* Background Stars */}
      <Universe />
      
      <Navbar />

      <main className="relative z-10 max-w-[900px] mx-auto px-6 md:px-12 pt-32 pb-24 flex flex-col gap-10">
        
        {/* Back Link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white tracking-widest uppercase transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Page Header */}
        <header className="text-center max-w-2xl mx-auto flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center mx-auto mb-2">
            <HelpCircle className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-heading text-xs font-bold tracking-[0.45em] text-[#7DD3FC] uppercase">
            DEVELOPER CONSOLE
          </span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl tracking-wide bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            Technical Troubleshooting & FAQ
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
            Diagnostics, local weights structure layouts, swarm execution mechanics, and protocol integration guidelines for the AEGIS microkernel.
          </p>
        </header>

        {/* Search & Filter Toolbar */}
        <div className="glass-card p-4 rounded-full border border-white/5 bg-white/[0.02] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 px-2 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setOpenIndex(null);
                }}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-white text-black font-extrabold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 pr-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOpenIndex(null);
              }}
              placeholder="Search diagnostics..."
              className="w-full rounded-full bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-[#4D7CFE]"
            />
          </div>
        </div>

        {/* Accordions Container */}
        <div className="flex flex-col gap-4 min-h-[300px]">
          {filteredEntries.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center gap-3 text-gray-500">
              <BookOpen className="w-12 h-12 text-gray-700 animate-pulse" />
              <p className="text-sm">No diagnostic logs found matching your query.</p>
            </div>
          ) : (
            filteredEntries.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-white/5 rounded-2xl bg-white/[0.015] hover:bg-white/[0.025] hover:border-white/10 overflow-hidden transition-all duration-300 text-left"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-6 flex items-center justify-between text-left cursor-pointer transition-all"
                  >
                    <div className="flex flex-col gap-1.5 pr-4">
                      <span className="text-[8px] font-bold text-[#7DD3FC] tracking-widest uppercase">
                        {faq.category}
                      </span>
                      <h3 className="font-heading font-extrabold text-sm sm:text-base text-white tracking-wide uppercase">
                        {faq.question}
                      </h3>
                    </div>
                    {isOpen ? (
                      <Minus className="w-5 h-5 text-[#7DD3FC] shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-500 shrink-0" />
                    )}
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[1000px] border-t border-white/[0.03]" : "max-h-0"
                    }`}
                  >
                    <div className="p-6 font-body text-xs md:text-sm text-gray-400 leading-relaxed font-light bg-black/40">
                      {faq.answer.split("\n").map((line, i) => (
                        <p key={i} className="mb-2 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <MinimalEnding />
    </div>
  );
}
