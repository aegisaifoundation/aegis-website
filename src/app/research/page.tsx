"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Universe from "@/components/background/Universe";
import { BookOpen, Search, ArrowRight, Download, Calendar, User } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface ResearchPaper {
  id: string;
  title: string;
  slug: string;
  category: string;
  abstract: string;
  authors: string;
  date: string;
  pdfUrl: string;
  tags: string;
}

export default function PublicResearchLibrary() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    const q = query(collection(db, "research"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ResearchPaper[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ResearchPaper);
      });
      setPapers(list);
      setLoading(false);
    }, (err) => {
      console.error("Failed to sync research papers:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const categories = ["ALL", ...Array.from(new Set(papers.map((p) => p.category)))];

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.tags.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || paper.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen bg-black text-white font-body selection:bg-[#4D7CFE] selection:text-white">
      {/* Background stars */}
      <Universe />
      
      <Navbar />

      <main className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 pt-32 pb-24 flex flex-col gap-12">
        {/* Page Title */}
        <header className="text-center max-w-2xl mx-auto flex flex-col gap-4">
          <span className="font-heading text-xs font-bold tracking-[0.45em] text-[#7DD3FC] uppercase">
            RESOURCE REPOSITORY
          </span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl tracking-wide bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            Research & Documentation
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
            Scientific blueprints, consensus protocols, federated learning adaptors, and system metrics powering collective intelligence.
          </p>
        </header>

        {/* Search & Filter Toolbar */}
        <div className="glass-card p-4 rounded-full border border-white/5 bg-white/[0.02] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 px-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search publications..."
              className="w-full rounded-full bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-[#4D7CFE]"
            />
          </div>
        </div>

        {/* Papers Listing Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs text-gray-500 font-mono animate-pulse">
            Establishing secure connection and downloading data enclaves...
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-3 text-gray-500">
            <BookOpen className="w-12 h-12 text-gray-700 animate-pulse" />
            <p className="text-sm">No research publications found matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPapers.map((paper) => (
              <div 
                key={paper.id} 
                className="glass-card p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] flex flex-col justify-between gap-6 transition-all duration-350 hover:border-white/15 hover:shadow-[0_0_40px_rgba(255,255,255,0.03)] group"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-[#7DD3FC]">
                    <span>{paper.category}</span>
                    <span className="font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {paper.date}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-xl text-white group-hover:text-[#7DD3FC] transition-colors leading-snug">
                    {paper.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <User className="w-3.5 h-3.5" />
                    <span>{paper.authors}</span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed font-light line-clamp-3">
                    {paper.abstract}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                  <Link
                    href={`/research/${paper.slug}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#7DD3FC] transition-colors group/link"
                  >
                    <span>Read Abstract</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5" />
                  </Link>

                  {paper.pdfUrl && (
                    <a
                      href={paper.pdfUrl}
                      download
                      className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:text-[#7DD3FC] transition-all cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
