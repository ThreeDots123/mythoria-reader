"use client";

import { Star, LockKeyhole, BookOpen, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AllSeriesResponse } from "@/api/types";
import { allSeries } from "@/routes/client";
import { cn } from "@/lib/utils";

interface NovelCardProps {
  series: AllSeriesResponse;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo`;
}

export default function NovelCard({ series }: NovelCardProps) {
  const hasRating = series.averageRating > 0;
  const totalChapters =
    series.recentChapters.length > 0
      ? Math.max(...series.recentChapters.map((c) => c.chapterNumber))
      : 0;

  const statusLabel =
    series.status === "completed"
      ? "Completed"
      : series.status === "hiatus"
      ? "Hiatus"
      : series.status === "cancelled"
      ? "Dropped"
      : "Ongoing";

  const statusColor =
    series.status === "completed"
      ? "text-emerald-400"
      : series.status === "hiatus"
      ? "text-yellow-400"
      : series.status === "cancelled"
      ? "text-red-400"
      : "text-primary";

  return (
    <div className="group">
      <Link
        href={`${allSeries}/${series.slug}`}
        className="flex flex-col sm:flex-row gap-2.5 sm:gap-3"
      >
        {/* Cover */}
        <div className="relative w-full sm:w-32 aspect-3/4 rounded-lg overflow-hidden shrink-0">
          <Image
            alt={series.title}
            src={series.featuredImage || "/placeholder.svg"}
            fill
            sizes="(max-width: 640px) 50vw, 128px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-white bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded uppercase tracking-wide">
            {series.novelType || "Novel"}
          </span>

          {totalChapters > 0 && (
            <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
              <BookOpen className="w-2.5 h-2.5" />
              {totalChapters}
            </span>
          )}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {series.title}
          </h3>

          <div className="flex items-center gap-2 mt-1.5">
            {hasRating ? (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-foreground">
                  {series.averageRating.toFixed(1)}
                </span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/60">New</span>
            )}
            <span
              className={cn("text-[11px] font-semibold uppercase", statusColor)}
            >
              {statusLabel}
            </span>
          </div>

          {series.categories.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {series.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Recent chapters — hidden on small screens, shown on sm+ */}
      {series.recentChapters.length > 0 && (
        <div className="hidden sm:block mt-2 ml-[calc(8rem+0.75rem)] space-y-1">
          {series.recentChapters.slice(0, 4).map((ch) => {
            const isNew =
              new Date().getTime() - new Date(ch.publishDate).getTime() <
              86400000;

            return (
              <Link
                key={ch.id}
                href={`${allSeries}/${series.slug}`}
                className="flex items-center justify-between text-xs py-1 px-2 -mx-2 rounded-md hover:bg-muted/20 transition-colors"
              >
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="text-foreground font-medium">
                    Ch. {ch.chapterNumber}
                  </span>
                  {isNew && (
                    <span className="text-[9px] font-bold text-primary bg-primary/15 px-1.5 py-px rounded">
                      NEW
                    </span>
                  )}
                </span>

                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {timeAgo(ch.publishDate)}
                  </span>
                  {ch.isPremium ? (
                    <span className="flex items-center gap-0.5 text-coin-gold">
                      <LockKeyhole className="w-2.5 h-2.5" />
                      <span className="text-[10px] font-semibold">
                        {ch.priceInCoins}c
                      </span>
                    </span>
                  ) : (
                    <BookOpen className="w-2.5 h-2.5 text-muted-foreground/50" />
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
