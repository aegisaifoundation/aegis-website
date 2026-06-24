import type { MetadataRoute } from "next";
import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://aegis.com";
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/agent-ecosystem`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    // 1. Fetch dynamic slugs from website_pages
    const pagesSnap = await getDocs(collection(db, "website_pages"));
    pagesSnap.forEach((docSnap) => {
      const slug = docSnap.id;
      // Skip the default config doc 'home' which is used internally for home ordering
      if (slug !== "home") {
        routes.push({
          url: `${baseUrl}/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    });

    // 2. Fetch dynamic research papers
    const researchSnap = await getDocs(collection(db, "research"));
    researchSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.slug) {
        routes.push({
          url: `${baseUrl}/research/${data.slug}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    });
  } catch (err) {
    console.error("Sitemap dynamic generation error:", err);
  }

  return routes;
}
