import type { MetadataRoute } from "next";
import apiClientManager from "@/api/interface";

const baseUrl = "https://www.mythoriatales.com";

async function getSeriesEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const response = await apiClientManager.getAllSeries(page, limit);

    if (!response.success) {
      break;
    }

    for (const series of response.data.data) {
      const latestChapter = series.recentChapters?.[0];

      entries.push({
        url: `${baseUrl}/series/${series.slug}`,
        lastModified: latestChapter
          ? new Date(latestChapter.publishDate)
          : new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    if (page >= response.data.totalPages) {
      break;
    }

    page += 1;
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/series`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/announcements`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dmca`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const seriesEntries = await getSeriesEntries();

  return [...staticEntries, ...seriesEntries];
}
