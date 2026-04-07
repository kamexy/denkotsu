import type { MetadataRoute } from "next";
import { getAllGuides } from "@/lib/guides";
import { getAllKeyPoints } from "@/lib/key-points";
import {
  getPracticalDefectQuestions,
  getPracticalWiringProblems,
} from "@/lib/practical";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const staticRoutes = [
  "",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/guides",
  "/key-points",
  "/learn",
  "/practical",
  "/practical/wiring",
  "/practical/defects",
  "/practical/timeline",
  "/collection",
  "/stats",
  "/settings",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const guideEntries: MetadataRoute.Sitemap = getAllGuides().map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const keyPointEntries: MetadataRoute.Sitemap = getAllKeyPoints().map((keyPoint) => ({
    url: `${SITE_URL}/key-points/${keyPoint.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const wiringEntries: MetadataRoute.Sitemap = getPracticalWiringProblems().map((problem) => ({
    url: `${SITE_URL}/practical/wiring/${problem.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const defectEntries: MetadataRoute.Sitemap = getPracticalDefectQuestions().map((question) => ({
    url: `${SITE_URL}/practical/defects/${question.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...guideEntries,
    ...keyPointEntries,
    ...wiringEntries,
    ...defectEntries,
  ];
}
