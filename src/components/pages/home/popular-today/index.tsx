"use client";

import { useEffect, useState } from "react";
import { FlameIcon, StarIcon, Eye, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPopularTodaySeriesAction } from "@/server-actions/chapter";
import { getMostPopularSeriesAction } from "@/server-actions/chapter";
import { PopularSeriesResponse } from "@/api/types";
import { allSeries } from "@/routes/client";
import { Skeleton } from "@/components/ui/skeleton";
import Carousel from "@/components/utility/carousel";

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function PopularTodaySkeleton() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2.5 mb-6">
          <FlameIcon className="w-5 h-5 text-primary" fill="currentColor" />
          <h2 className="text-xl font-bold text-foreground">Popular Today</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-none w-[160px] aspect-3/4 rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PopularToday() {
  const [series, setSeries] = useState<PopularSeriesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopular = async () => {
      setLoading(true);
      try {
        const [todayResult, allTimeResult] = await Promise.all([
          getPopularTodaySeriesAction(6),
          getMostPopularSeriesAction(9),
        ]);

        const combined: PopularSeriesResponse[] = [];
        const seenIds = new Set<string>();

        if (todayResult.success && todayResult.data) {
          for (const s of todayResult.data) {
            if (!seenIds.has(s.id)) {
              seenIds.add(s.id);
              combined.push(s);
            }
          }
        }
        if (allTimeResult.success && allTimeResult.data) {
          for (const s of allTimeResult.data) {
            if (!seenIds.has(s.id)) {
              seenIds.add(s.id);
              combined.push(s);
            }
          }
        }

        setSeries(combined);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  if (loading) return <PopularTodaySkeleton />;
  if (error || series.length === 0) return null;

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <FlameIcon
              className="w-5 h-5 text-destructive"
              fill="currentColor"
            />
            <h2 className="text-xl font-bold text-foreground">Popular Today</h2>
          </div>
          <Link
            href={allSeries}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View All Popular
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <Carousel>
          {series.map((novel, index) => {
            const isHot = index < 2;

            return (
              <Link
                key={novel.id}
                href={`${allSeries}/${novel.slug}`}
                className="group flex-none w-[160px] sm:w-[175px] pr-4"
              >
                <div className="relative aspect-3/4 rounded-xl overflow-hidden mb-2.5">
                  {novel.featuredImage ? (
                    <Image
                      src={novel.featuredImage}
                      alt={novel.title}
                      fill
                      sizes="175px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                  {isHot && (
                    <div className="absolute top-2 left-2 bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      HOT
                    </div>
                  )}

                  <div className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm">
                    <span className="text-xs font-bold text-white">
                      {index + 1}
                    </span>
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
                </div>
              </Link>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}
