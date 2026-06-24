import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research & Documentation",
  description: "Scientific blueprints, consensus protocols, federated learning adaptors, and system metrics powering collective intelligence.",
  alternates: {
    canonical: "/research",
  },
  openGraph: {
    title: "Research & Documentation | AEGIS",
    description: "Scientific blueprints, consensus protocols, federated learning adaptors, and system metrics powering collective intelligence.",
    url: "https://aegis.com/research",
    type: "website",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://aegis.com",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Research",
      "item": "https://aegis.com/research",
    },
  ],
};

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
