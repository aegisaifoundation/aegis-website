import React from "react";
import type { Metadata } from "next";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

async function getPaper(slug: string) {
  try {
    const q = query(
      collection(db, "research"),
      where("slug", "==", slug),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      return {
        title: data.title || "",
        abstract: data.abstract || "",
        authors: data.authors || "",
        date: data.date || "",
        category: data.category || "Research",
        tags: data.tags || "",
      };
    }
  } catch (err) {
    console.error("Failed to load paper in layout:", err);
  }
  return null;
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { slug } = await params;
  const paper = await getPaper(slug);

  if (!paper) {
    return {
      title: "Research Publication",
      description: "Read research publications from AEGIS AI Foundation.",
    };
  }

  return {
    title: paper.title,
    description: paper.abstract.substring(0, 160),
    alternates: {
      canonical: `/research/${slug}`,
    },
    openGraph: {
      title: `${paper.title} | AEGIS Research`,
      description: paper.abstract,
      url: `https://aegis.com/research/${slug}`,
      type: "article",
      authors: [paper.authors],
    },
  };
}

export default async function ResearchDetailLayout({ children, params }: Props) {
  const { slug } = await params;
  const paper = await getPaper(slug);

  let articleSchema = null;
  if (paper) {
    articleSchema = {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": paper.title,
      "description": paper.abstract,
      "author": {
        "@type": "Person",
        "name": paper.authors,
      },
      "publisher": {
        "@type": "Organization",
        "name": "AEGIS AI Foundation",
        "logo": {
          "@type": "ImageObject",
          "url": "https://aegis.com/assets/logo.png",
        },
      },
      "genre": paper.category,
      "keywords": paper.tags,
      "mainEntityOfPage": `https://aegis.com/research/${slug}`,
    };
  }

  return (
    <>
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {children}
    </>
  );
}
