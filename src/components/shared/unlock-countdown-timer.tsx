"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const PREMIUM_DURATION_DAYS = 14;

interface UnlockCountdownTimerProps {
  publishDate: string;
  className?: string;
  compact?: boolean;
}

function getTimeRemaining(publishDate: string) {
  const freeDate = new Date(publishDate);
  freeDate.setDate(freeDate.getDate() + PREMIUM_DURATION_DAYS);

  const now = new Date();
  const diff = freeDate.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, totalMs: diff };
}

export function UnlockCountdownTimer({
  publishDate,
  className,
  compact = false,
}: UnlockCountdownTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    getTimeRemaining(publishDate),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getTimeRemaining(publishDate);
      if (!next) {
        clearInterval(interval);
      }
      setRemaining(next);
    }, 1000);
    return () => clearInterval(interval);
  }, [publishDate]);

  if (!remaining) return null;

  const isUrgent = remaining.days === 0;

  if (compact) {
    const label = remaining.days > 0
      ? `${remaining.days}d ${remaining.hours}h`
      : `${remaining.hours}h ${remaining.minutes}m`;

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs",
          isUrgent ? "text-countdown-urgency" : "text-muted-foreground",
          className,
        )}
      >
        <Clock className="w-3 h-3" />
        Free in {label}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        isUrgent ? "text-countdown-urgency" : "text-muted-foreground",
        className,
      )}
    >
      <Clock className={cn("w-4 h-4", isUrgent && "animate-pulse-soft")} />
      <span>
        Becomes free in{" "}
        {remaining.days > 0 ? (
          <span className="font-semibold">
            {remaining.days}d {remaining.hours}h {remaining.minutes}m
          </span>
        ) : (
          <span className="font-semibold">
            {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
          </span>
        )}
      </span>
    </div>
  );
}
