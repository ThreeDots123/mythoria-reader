"use client";

import { LockKeyhole, Clock, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLatestUpdatesAction } from "@/server-actions/chapter";
import { LatestUpdateResponse } from "@/api/types";
import { allSeries } from "@/routes/client";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

function LatestNovelSkeleton() {
  return (
    <div className="flex gap-3 p-4 rounded-xl border border-border/20 bg-surface-elevated">
      <Skeleton className="w-[80px] aspect-3/4 rounded-lg bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-muted" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default function LatestNovels() {
  const [novels, setNovels] = useState<LatestUpdateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const result = await getLatestUpdatesAction();
        if (result.success && result.data) {
          setNovels(result.data);
        } else {
          setError(result.error || "Failed to fetch latest novels");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) {
    return (
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2.5 mb-6">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">
              Latest Novel Updates
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <LatestNovelSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || novels.length === 0) {
    return (
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2.5 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Latest Novel Updates
            </h2>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-border/20 bg-surface-elevated py-12 px-6">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5" />
            <div className="relative flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-14 rounded-md bg-muted/40 border border-border/20"
                    style={{
                      transform: `translateY(${Math.abs(i - 2.5) * 4}px)`,
                    }}
                  />
                ))}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                No updates yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Chapter updates will appear here as translators publish new
                content. Check back soon!
              </p>
              <Link
                href={allSeries}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">
              Latest Novel Updates
            </h2>
          </div>
          <Link
            href={allSeries}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View All Latest Updates
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {novels.map((novel) => {
            const hasNewChapter = novel.chapters.some((ch) => ch.isNew);

            return (
              <div
                key={novel.seriesSlug}
                className="rounded-xl border border-border/20 bg-surface-elevated p-4 hover:border-border/40 transition-colors"
              >
                <div className="flex gap-3 mb-3">
                  <Link
                    href={`${allSeries}/${novel.seriesSlug}`}
                    className="relative w-[80px] aspect-3/4 rounded-lg overflow-hidden shrink-0 group"
                  >
                    {novel.seriesImage ? (
                      <Image
                        src={novel.seriesImage}
                        alt={novel.seriesName}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                    {hasNewChapter && (
                      <div className="absolute bottom-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse" />
                        New Chapter
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`${allSeries}/${novel.seriesSlug}`}>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {novel.seriesName}
                      </h3>
                    </Link>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {novel.chapters.slice(0, 4).map((chapter) => (
                    <Link
                      key={chapter.chapterNumber}
                      href={`${allSeries}/${novel.seriesSlug}/chapter/${chapter.chapterNumber}`}
                      className="flex items-center justify-between text-xs py-1 hover:bg-muted/5 rounded px-1 -mx-1 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">
                          Ch. {chapter.chapterNumber}
                        </span>
                        {chapter.isNew && (
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            NEW
                          </span>
                        )}
                        {!chapter.isNew && !chapter.isPremium && (
                          <span className="text-[9px] font-medium text-muted-foreground/60 bg-muted/20 px-1.5 py-0.5 rounded uppercase">
                            Unlocked
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground/60">
                          {chapter.timeAgo}
                        </span>
                        {chapter.isPremium ? (
                          <span className="flex items-center gap-0.5 text-coin-gold font-medium">
                            <LockKeyhole className="w-3 h-3" />
                            {chapter.priceInCoins}c
                          </span>
                        ) : (
                          <BookOpen className="w-3 h-3 text-muted-foreground/40" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
