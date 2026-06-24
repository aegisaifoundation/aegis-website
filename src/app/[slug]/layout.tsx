import React from "react";
import type { Metadata } from "next";
import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

async function getPageConfig(slug: string) {
  try {
    const docRef = doc(db, "website_pages", slug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        title: data.title || "",
        description: data.description || "",
        template: data.template || "grid",
        category: data.category || "",
      };
    }
  } catch (err) {
    console.error("Failed to load page config in layout:", err);
  }
  return null;
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { slug } = await params;

  // Skip dynamic checks for standard system routes
  if (slug === "favicon.ico" || slug === "manifest.json" || slug === "sitemap.xml" || slug === "robots.txt") {
    return {};
  }

  const page = await getPageConfig(slug);

  if (!page) {
    return {
      title: "AEGIS Capsule",
      description: "Custom information enclave from AEGIS AI Foundation.",
    };
  }

  return {
    title: page.title,
    description: page.description.substring(0, 160),
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title: `${page.title} | AEGIS`,
      description: page.description,
      url: `https://aegis.com/${slug}`,
      type: "website",
    },
  };
}

export default async function CustomPageLayout({ children, params }: Props) {
  const { slug } = await params;
  const page = await getPageConfig(slug);

  let webpageSchema = null;
  if (page) {
    webpageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": page.title,
      "description": page.description,
      "url": `https://aegis.com/${slug}`,
      "publisher": {
        "@id": "https://aegis.com/#organization",
      },
    };
  }

  return (
    <>
      {webpageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
        />
      )}
      {children}
    </>
  );
}
