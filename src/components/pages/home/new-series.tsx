"use client";

import {
  StarIcon,
  Eye,
  ChevronRight,
  Sparkles,
  Heart,
  Bookmark,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { allSeries } from "@/routes/client";
import { getNewSeriesAction } from "@/server-actions/series";
import { NewSeriesResponse } from "@/api/types";
import Carousel from "@/components/utility/carousel";
import { Skeleton } from "@/components/ui/skeleton";

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function NewSeriesSkeleton() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2.5 mb-6">
          <Sparkles className="w-5 h-5 text-muted-foreground" />
          <Skeleton className="h-6 w-36 bg-muted" />
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-none w-[160px] sm:w-[180px]">
              <Skeleton className="aspect-3/4 rounded-xl bg-muted mb-2.5" />
              <Skeleton className="h-4 w-full bg-muted mb-1.5" />
              <Skeleton className="h-3 w-20 bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function NewSeries() {
  const [series, setSeries] = useState<NewSeriesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewSeries = async () => {
      try {
        const result = await getNewSeriesAction();
        if (result.success && result.data) {
          setSeries(result.data);
        } else {
          setError(result.error || "Failed to fetch new series");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchNewSeries();
  }, []);

  if (loading) return <NewSeriesSkeleton />;

  if (error || series.length === 0) {
    return (
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2.5 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">New Series</h2>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-border/20 bg-surface-elevated py-12 px-6">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5" />
            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
                <div className="relative w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-muted-foreground/50" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                No new series this week
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                New series are added regularly. In the meantime, explore our
                existing catalog — there's plenty to discover!
              </p>
              <Link
                href={allSeries}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Explore all series
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
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">New Series</h2>
          </div>
          <Link
            href={allSeries}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View All New Series
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <Carousel>
          {series.map((novel) => (
            <Link
              key={novel.id}
              href={`${allSeries}/${novel.slug}`}
              className="group flex-none w-[160px] sm:w-[180px] pr-4"
            >
              <div className="relative aspect-3/4 rounded-xl overflow-hidden mb-2.5">
                {novel.featuredImage ? (
                  <Image
                    src={novel.featuredImage}
                    alt={novel.title}
                    fill
                    sizes="180px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
                    <span className="text-muted-foreground/40 text-xs">
                      No Cover
                    </span>
                  </div>
                )}

                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">
                  NEW
                </div>

                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded">
                  {novel.addedAgo}
                </div>

                <div className="absolute bottom-2 left-2 bg-destructive/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-2 h-2 bg-white/80 rounded-sm" />
                  {novel.novelType}
                </div>
              </div>

              <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                {novel.title}
              </h3>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {novel.rating !== null ? (
                  <span className="flex items-center gap-0.5">
                    <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {novel.rating}
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <StarIcon className="w-3 h-3 text-muted-foreground/50" />
                    <small>Not Rated</small>
                  </span>
                )}
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  {formatViews(novel.views)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Heart className="w-3 h-3" />
                  {formatViews(novel.likes)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Bookmark className="w-3 h-3" />
                  {formatViews(novel.bookmarks)}
                </span>
              </div>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
