import RSS from "rss";
import { getFreeChapters } from "@/server-actions/chapter";

const siteUrl = "https://www.mythoriatales.com";

export async function GET() {
  const feed = new RSS({
    title: "Mythoria",
    description:
      "The Special Vault Edition of Novels. Premium translated novels for readers worldwide.",
    site_url: siteUrl,
    feed_url: `${siteUrl}/feed.xml`,
    copyright: `${new Date().getFullYear()} Mythoria`,
    language: "en",
    pubDate: new Date(),
  });

  const result = await getFreeChapters();

  if (result.success) {
    for (const chapter of result.data) {
      feed.item({
        title: `${chapter.series.title} - ${chapter.title}`,
        description: chapter.contentPreview,
        url: `${siteUrl}/series/${chapter.series.slug}/chapter/${chapter.chapterNumber}`,
        guid: chapter.id,
        categories: chapter.series.categories,
        date: chapter.publishDate,
        enclosure: chapter.series.featuredImage
          ? { url: chapter.series.featuredImage }
          : undefined,
      });
    }
  }

  return new Response(feed.xml(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
