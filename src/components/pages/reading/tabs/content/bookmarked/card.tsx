"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { BookmarkResponse } from "@/api/types";
import { removeBookmarkAction } from "@/server-actions/bookmark";
import { allSeries } from "@/routes/client";
import { Spinner } from "@/components/ui/spinner";

// Date formatting helper
const formatDate = (date: string | Date) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return dateObj.toLocaleDateString();
};

export default function BookmarkedChaptersCard({
  bookmark,
  onRemove,
}: {
  bookmark: BookmarkResponse;
  onRemove: () => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const series = bookmark.series;

  if (!series) {
    return null;
  }

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const result = await removeBookmarkAction(bookmark.seriesId);
      if (result.success) {
        onRemove();
      }
    } catch (err: any) {
      console.error("Error removing bookmark:", err);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:border-none hover:bg-card/60 transition-colors max-w-xl">
      <div className="flex gap-6 p-6">
        <div className="shrink-0">
          <Image
            width={128}
            height={176}
            src={series.featuredImage || "/placeholder.svg"}
            alt={`Cover of ${series.title}`}
            sizes="128px"
            className="w-32 h-44 object-cover rounded-lg"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              {series.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bookmarked {formatDate(bookmark.bookmarkedAt)}
            </p>
            {series.categories && series.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {series.categories.slice(0, 3).map((category, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-secondary/20 rounded"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex max-sm:flex-col gap-3">
            <Link href={`${allSeries}/${series.slug}`} className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90">
                View Series
              </Button>
            </Link>
            <Button
              variant="outline"
              className="max-sm:border-accent"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <Spinner className="mr-2 w-4 h-4" />
                  Removing...
                </>
              ) : (
                "Remove Bookmark"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
