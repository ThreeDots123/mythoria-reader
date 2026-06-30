"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  BookmarkIcon,
  Eye,
  Heart,
  Play,
  Share2Icon,
  BookOpen,
  Star,
} from "lucide-react";
import { SeriesDetailsResponse } from "@/api/types";
import { allSeries } from "@/routes/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface CoverAndActionsProps {
  series: SeriesDetailsResponse;
  chaptersLength: number;
  lastReadChapter: number | null;
  isBookmarked: boolean;
  isBookmarking: boolean;
  isLiked: boolean;
  isLiking: boolean;
  onBookmarkToggle: () => void;
  onLikeToggle: () => void;
}

function formatStat(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function CoverAndActions({
  series,
  chaptersLength,
  lastReadChapter,
  isBookmarked,
  isBookmarking,
  isLiked,
  isLiking,
  onBookmarkToggle,
  onLikeToggle,
}: CoverAndActionsProps) {
  const handleShare = async () => {
    const url = window.location.href;
    const title = series.title || "Check out this series";
    const text = `Check out "${title}" on Mythoria`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

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
      ? "text-emerald-400 border-emerald-400/30"
      : series.status === "hiatus"
        ? "text-yellow-400 border-yellow-400/30"
        : series.status === "cancelled"
          ? "text-red-400 border-red-400/30"
          : "text-primary border-primary/30";

  return (
    <div className="sticky top-24">
      {/* Cover with glow */}
      <div className="relative mb-5 rounded-xl overflow-hidden shadow-2xl">
        <Image
          src={series.featuredImage || "/placeholder.svg"}
          alt={`Cover of ${series.title}`}
          width={300}
          height={400}
          sizes="(max-width: 768px) 100vw, 300px"
          className="w-full h-auto"
        />
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="flex flex-col items-center py-2.5 rounded-lg bg-card/50 border border-border/20">
          <Eye className="w-4 h-4 text-muted-foreground mb-1" />
          <span className="text-sm font-bold text-foreground">{formatStat(series.totalViews ?? 0)}</span>
          <span className="text-[10px] text-muted-foreground">Views</span>
        </div>
        <div className="flex flex-col items-center py-2.5 rounded-lg bg-card/50 border border-border/20">
          <Heart className="w-4 h-4 text-muted-foreground mb-1" />
          <span className="text-sm font-bold text-foreground">{formatStat(series.totalLikes ?? 0)}</span>
          <span className="text-[10px] text-muted-foreground">Likes</span>
        </div>
        <div className="flex flex-col items-center py-2.5 rounded-lg bg-card/50 border border-border/20">
          <BookmarkIcon className="w-4 h-4 text-muted-foreground mb-1" />
          <span className="text-sm font-bold text-foreground">{formatStat(series.totalBookmarks ?? 0)}</span>
          <span className="text-[10px] text-muted-foreground">Saved</span>
        </div>
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-md border uppercase", statusColor)}>
          {statusLabel}
        </span>
        {series.averageRating > 0 && (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-amber-400/30 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            {series.averageRating.toFixed(1)}
          </span>
        )}
        <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md border border-border/30 text-muted-foreground">
          <BookOpen className="w-3 h-3" />
          {series.totalChapters} Ch.
        </span>
      </div>

      {/* CTA buttons */}
      <div className="space-y-2.5">
        {chaptersLength > 0 && (
          <>
            {lastReadChapter != null ? (
              <>
                <Link href={`${allSeries}/${series.slug}/chapter/${lastReadChapter}`} className="block">
                  <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Play className="w-4 h-4" />
                    Continue Ch. {lastReadChapter}
                  </button>
                </Link>
                <Link href={`${allSeries}/${series.slug}/chapter/1`} className="block">
                  <button className="w-full bg-card hover:bg-card/80 border border-border/40 text-foreground font-medium py-2.5 rounded-lg text-sm transition-colors">
                    Start from Chapter 1
                  </button>
                </Link>
              </>
            ) : (
              <Link href={`${allSeries}/${series.slug}/chapter/1`} className="block">
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Play className="w-4 h-4" />
                  Start Reading
                </button>
              </Link>
            )}
          </>
        )}

        {/* Action bar */}
        <div className="flex gap-2">
          <button
            onClick={onLikeToggle}
            disabled={isLiking}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50",
              isLiked
                ? "border-primary/40 text-primary bg-primary/10"
                : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            {isLiked ? "Liked" : "Like"}
          </button>
          <button
            onClick={onBookmarkToggle}
            disabled={isBookmarking}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50",
              isBookmarked
                ? "border-primary/40 text-primary bg-primary/10"
                : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
            {isBookmarked ? "Saved" : "Save"}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center w-11 py-2.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <Share2Icon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
