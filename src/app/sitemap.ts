import type { MetadataRoute } from "next";
import { getAllSeoLandingPairs, getSeoLandingPath, getSiteUrl } from "@/lib/seoLanding";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/listings`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const seoLandingRoutes: MetadataRoute.Sitemap = getAllSeoLandingPairs().map(({ category, district }) => ({
    url: `${baseUrl}${getSeoLandingPath(category, district)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: category === "Santexnik" || category === "Elektrik" ? 0.75 : 0.65,
  }));

  return [...staticRoutes, ...seoLandingRoutes];
}
