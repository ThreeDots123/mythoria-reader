"use client";

import { Eye, Star, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialProofBarProps {
  totalViews?: number;
  averageRating?: number;
  totalBookmarks?: number;
  className?: string;
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function SocialProofBar({
  totalViews,
  averageRating,
  totalBookmarks,
  className,
}: SocialProofBarProps) {
  const items = [
    totalViews != null && {
      icon: Eye,
      label: `${formatCount(totalViews)} readers`,
    },
    averageRating != null &&
      averageRating > 0 && {
        icon: Star,
        label: `${averageRating.toFixed(1)} rating`,
      },
    totalBookmarks != null && {
      icon: Bookmark,
      label: `${formatCount(totalBookmarks)} bookmarks`,
    },
  ].filter(Boolean) as { icon: React.ComponentType<any>; label: string }[];

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-4 text-xs text-muted-foreground",
        className,
      )}
    >
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <item.icon className="w-3.5 h-3.5" />
          {item.label}
        </span>
      ))}
    </div>
  );
}
