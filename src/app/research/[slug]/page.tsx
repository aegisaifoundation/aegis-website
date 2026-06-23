"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Universe from "@/components/background/Universe";
import { ArrowLeft, BookOpen, Download, Calendar, User, Tag, ShieldAlert } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

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

export default function PublicResearchDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPaper() {
      try {
        const q = query(
          collection(db, "research"),
          where("slug", "==", slug),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setPaper({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ResearchPaper);
        }
      } catch (err) {
        console.error("Failed to load research paper:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPaper();
  }, [slug]);

  return (
    <div className="relative min-h-screen bg-black text-white font-body selection:bg-[#4D7CFE] selection:text-white">
      <Universe />
      
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 pt-32 pb-24 flex flex-col gap-8">
        
        {/* Back Link */}
        <Link
          href="/research"
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white tracking-widest uppercase transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to publications
        </Link>

        {loading ? (
          <div className="py-24 text-center text-xs text-gray-500 font-mono animate-pulse">
            Downloading secure data enclave abstract...
          </div>
        ) : !paper ? (
          <div className="py-24 text-center flex flex-col items-center gap-4 text-gray-500">
            <ShieldAlert className="w-12 h-12 text-gray-700 animate-pulse" />
            <h2 className="text-xl font-heading font-bold text-white">Publication Not Found</h2>
            <p className="text-sm max-w-xs mx-auto leading-normal">
              The research publication you are looking for does not exist or has been de-indexed.
            </p>
          </div>
        ) : (
          <article className="glass-card p-8 md:p-12 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
            
            {/* Category and date */}
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#7DD3FC] border-b border-white/5 pb-4">
              <span>{paper.category}</span>
              <span className="font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {paper.date}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl leading-snug text-white">
              {paper.title}
            </h1>

            {/* Authors */}
            <div className="flex items-center gap-2 text-xs text-gray-300 font-semibold border-b border-white/5 pb-6">
              <User className="w-4 h-4 text-gray-400" />
              <span>Authors: {paper.authors}</span>
            </div>

            {/* Abstract Section */}
            <div className="flex flex-col gap-4">
              <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-[#7DD3FC]">Abstract</h2>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed font-light whitespace-pre-wrap">
                {paper.abstract}
              </p>
            </div>

            {/* Tags */}
            {paper.tags && (
              <div className="flex flex-wrap gap-2 items-center mt-4">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                {paper.tags.split(",").map((tag) => (
                  <span 
                    key={tag} 
                    className="bg-white/5 border border-white/10 text-gray-400 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Download Link */}
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                download
                className="mt-8 self-start flex items-center justify-center gap-2 bg-[#4D7CFE] hover:bg-[#3b66d9] text-white px-6 py-3 rounded-full text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer"
              >
                <Download className="w-4 h-4" /> DOWNLOAD FULL PDF MANUSCRIPT
              </a>
            )}
          </article>
        )}
      </main>
    </div>
  );
}
