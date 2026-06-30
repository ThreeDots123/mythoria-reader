"use client";

import { useEffect, useState } from "react";
import { TrendingUp, StarIcon, Eye, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { allSeries } from "@/routes/client";
import { getRisingStarsAction } from "@/server-actions/series";
import { RisingStarResponse } from "@/api/types";
import { Skeleton } from "@/components/ui/skeleton";
import Carousel from "@/components/utility/carousel";

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function RisingStarsSkeleton() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2.5 mb-6">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          <Skeleton className="h-6 w-32 bg-muted" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-none w-[160px] sm:w-[175px]">
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

export default function RisingStars() {
  const [series, setSeries] = useState<RisingStarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRisingStars = async () => {
      try {
        const result = await getRisingStarsAction();
        if (result.success && result.data) {
          setSeries(result.data);
        } else {
          setError(result.error || "Failed to fetch rising stars");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRisingStars();
  }, []);

  if (loading) return <RisingStarsSkeleton />;
  if (error || series.length === 0) return null;

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Rising Stars</h2>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md">
              This week
            </span>
          </div>
          <Link
            href={allSeries}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <Carousel>
          {series.map((novel, index) => (
            <Link
              key={novel.id}
              href={`${allSeries}/${novel.slug}`}
              className="group shrink-0 w-[160px] sm:w-[175px] pr-4"
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
                  <div className="w-full h-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
                    <span className="text-muted-foreground/40 text-xs">
                      No Cover
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                {/* Rank */}
                <div className="absolute top-2 left-2 flex items-center justify-center w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm">
                  <span className="text-xs font-bold text-white">
                    {index + 1}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                {novel.title}
              </h3>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {novel.averageRating > 0 && (
                  <span className="flex items-center gap-0.5">
                    <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {novel.averageRating.toFixed(1)}
                  </span>
                )}
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  {formatViews(novel.weeklyReads)}
                </span>
              </div>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
