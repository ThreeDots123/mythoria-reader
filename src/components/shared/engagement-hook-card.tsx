"use client";

import { Unlock, Bookmark, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoinValueBadge } from "./coin-value-badge";
import { cn } from "@/lib/utils";

interface EngagementHookCardProps {
  nextChapterNumber: number;
  priceInCoins: number;
  seriesSlug: string;
  seriesCategories?: string[];
  onUnlock: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  className?: string;
}

export function EngagementHookCard({
  nextChapterNumber,
  priceInCoins,
  onUnlock,
  onBookmark,
  isBookmarked = false,
  className,
}: EngagementHookCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/40 bg-surface-elevated p-6 text-center animate-slide-up",
        className,
      )}
    >
      <p className="text-muted-foreground text-sm mb-2">
        You&apos;ve reached the end of free chapters
      </p>
      <h3 className="text-lg font-semibold mb-1">
        Continue to Chapter {nextChapterNumber}?
      </h3>
      <div className="flex justify-center mb-5">
        <CoinValueBadge coins={priceInCoins} showDollarValue size="md" />
      </div>

      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <Button
          onClick={onUnlock}
          className="w-full bg-linear-to-r from-(--unlock-gradient-from) to-(--unlock-gradient-to) text-black font-semibold hover:opacity-90"
        >
          <Unlock className="w-4 h-4 mr-2" />
          Unlock Next Chapter
        </Button>

        {onBookmark && (
          <Button
            variant="outline"
            onClick={onBookmark}
            className="w-full border-border/50"
          >
            <Bookmark
              className={cn(
                "w-4 h-4 mr-2",
                isBookmarked && "fill-current",
              )}
            />
            {isBookmarked ? "Bookmarked" : "Bookmark for Later"}
          </Button>
        )}

        <Button
          variant="ghost"
          asChild
          className="w-full text-muted-foreground"
        >
          <a href={`/series`}>
            <Library className="w-4 h-4 mr-2" />
            Browse More Novels
          </a>
        </Button>
      </div>
    </div>
  );
}
