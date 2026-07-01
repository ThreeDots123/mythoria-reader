"use client";

import { BookOpen, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { allSeries } from "@/routes/client";
import { getRecentlyReleasedChaptersAction } from "@/server-actions/chapter";
import { RecentlyReleasedChapterResponse } from "@/api/types";
import Carousel from "@/components/utility/carousel";
import { Skeleton } from "@/components/ui/skeleton";

function HeroSkeleton() {
  return (
    <section className="pt-6 pb-2">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2.5 mb-5">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          <Skeleton className="h-6 w-48 bg-muted" />
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-none w-[160px] sm:w-[175px]">
              <Skeleton className="aspect-3/4 rounded-xl bg-muted mb-2.5" />
              <Skeleton className="h-4 w-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Hero() {
  const [chapters, setChapters] = useState<RecentlyReleasedChapterResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const result = await getRecentlyReleasedChaptersAction();
        if (result.success && result.data) {
          setChapters(result.data);
        } else {
          setError(
            result.error || "Failed to fetch recently released chapters"
          );
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { latest: RecentlyReleasedChapterResponse; count: number }
    >();
    for (const chapter of chapters) {
      const existing = map.get(chapter.seriesSlug);
      if (!existing) {
        map.set(chapter.seriesSlug, { latest: chapter, count: 1 });
      } else {
        existing.count++;
        if (chapter.chapterNumber > existing.latest.chapterNumber) {
          existing.latest = chapter;
        }
      }
    }
    return Array.from(map.values());
  }, [chapters]);

  if (loading) return <HeroSkeleton />;

  if (error || chapters.length === 0) {
    return (
      <section className="pt-6 pb-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2.5 mb-5">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              New Chapters Released
            </h2>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-border/20 bg-surface-elevated py-14 px-6">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5" />
            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
                <div className="relative w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-muted-foreground/50" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                No recent chapters yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Our translators are hard at work. New chapters typically drop
                throughout the day — stay tuned!
              </p>
              <Link
                href={allSeries}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Browse all series
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-6 pb-2">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              New Chapters Released
            </h2>
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {chapters.length} new
            </span>
          </div>
        </div>

        <Carousel>
          {grouped.map(({ latest, count }) => (
            <Link
              key={latest.seriesSlug}
              href={`${allSeries}/${latest.seriesSlug}`}
              className="group flex-none w-[160px] sm:w-[175px] pr-4"
            >
              <div className="relative aspect-3/4 rounded-xl overflow-hidden mb-2.5">
                {latest.seriesImage ? (
                  <Image
                    src={latest.seriesImage}
                    alt={latest.seriesName}
                    fill
                    sizes="175px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
                    <span className="text-muted-foreground/40 text-xs">
                      No Cover
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">
                  Ch. {latest.chapterNumber}
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded">
                  <Clock className="w-2.5 h-2.5" />
                  {latest.releasedAgo}
                </div>

                {count > 1 && (
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-primary text-[10px] font-semibold px-2 py-0.5 rounded">
                    +{count - 1} more
                  </div>
                )}

                <div className="absolute bottom-0 inset-x-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold py-2 rounded-lg">
                    <BookOpen className="w-3.5 h-3.5" />
                    Read Ch. {latest.chapterNumber}
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {latest.seriesName}
              </h3>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
