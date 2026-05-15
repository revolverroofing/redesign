import type { MetadataRoute } from "next";
import { areaSlugs } from "@/lib/areas-content";
import { business } from "@/lib/business";
import { serviceSlugs } from "@/lib/services-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = business.url.replace(/\/$/, "");
  const lastModified = new Date();

  return [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...serviceSlugs.map((slug) => ({
      url: `${base}/services/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...areaSlugs.map((slug) => ({
      url: `${base}/areas/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
