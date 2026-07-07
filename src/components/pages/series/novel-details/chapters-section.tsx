"use client";

import Link from "next/link";
import { Lock, BookOpen, Search } from "lucide-react";
import ApplicationPagination from "@/components/utility/pagination";
import { formatDate } from "@/utils/format-date";
import { allSeries } from "@/routes/client";
import { SeriesDetailsChapterResponse } from "@/api/types";
import { CoinValueBadge } from "@/components/shared/coin-value-badge";
import { UnlockCountdownTimer } from "@/components/shared/unlock-countdown-timer";
import { cn } from "@/lib/utils";

export interface ChaptersSectionProps {
  seriesSlug: string;
  chapters: SeriesDetailsChapterResponse[];
  totalChapters: number;
  page: number;
  totalPages: number;
  chapterNumberInput: string;
  onChapterNumberChange: (value: string) => void;
  onReadChapter: () => void;
}

export function ChaptersSection({
  seriesSlug,
  chapters,
  totalChapters,
  page,
  totalPages,
  chapterNumberInput,
  onChapterNumberChange,
  onReadChapter,
}: ChaptersSectionProps) {
  const canRead =
    chapterNumberInput &&
    parseInt(chapterNumberInput, 10) >= 1 &&
    parseInt(chapterNumberInput, 10) <= totalChapters;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-foreground">
          Chapters
          <span className="text-muted-foreground font-normal text-base ml-2">
            {totalChapters}
          </span>
        </h2>
      </div>

      {/* Jump to chapter */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="number"
            min={1}
            max={totalChapters}
            value={chapterNumberInput}
            onChange={(e) => {
              const value = e.target.value;
              if (
                value === "" ||
                (parseInt(value, 10) >= 1 &&
                  parseInt(value, 10) <= totalChapters)
              ) {
                onChapterNumberChange(value);
              }
            }}
            placeholder={`Jump to chapter (1-${totalChapters})`}
            className="w-full h-10 pl-9 pr-4 text-sm rounded-lg bg-card border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && onReadChapter()}
          />
        </div>
        <button
          onClick={onReadChapter}
          disabled={!canRead}
          className="px-5 h-10 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Go
        </button>
      </div>

      {/* Chapter list */}
      <div className="space-y-1.5">
        {chapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={`${allSeries}/${seriesSlug}/chapter/${chapter.chapterNumber}`}
            className="block"
          >
            <div
              className={cn(
                "group flex items-center justify-between px-4 py-3 rounded-lg transition-colors",
                chapter.isPremium
                  ? "bg-card/30 hover:bg-card/50 border border-border/10"
                  : "hover:bg-card/40"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {chapter.isPremium ? (
                  <Lock className="w-4 h-4 text-coin-gold shrink-0" />
                ) : (
                  <BookOpen className="w-4 h-4 text-primary/60 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    Chapter {chapter.chapterNumber}
                    {chapter.title && (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        &mdash; {chapter.title}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDate(chapter.publishDate)}
                  </p>
                </div>
              </div>

              {/* {chapter.isPremium && (
                <div className="flex items-center gap-2.5 shrink-0 ml-3">
                  <UnlockCountdownTimer
                    publishDate={chapter.publishDate}
                    compact
                  />
                  <CoinValueBadge
                    coins={chapter.priceInCoins || 20}
                    size="sm"
                  />
                </div>
              )} */}
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <ApplicationPagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`${allSeries}/${seriesSlug}`}
          />
        </div>
      )}
    </div>
  );
}
