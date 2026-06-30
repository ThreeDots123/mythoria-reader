"use client";

import { useEffect, useState } from "react";
import { CalendarClock, BookOpen, Info, Bell, BellRing } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { allSeries } from "@/routes/client";
import { getUpcomingReleasesAction } from "@/server-actions/chapter";
import { UpcomingReleaseResponse } from "@/api/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import Carousel from "@/components/utility/carousel";

function UpcomingReleasesSkeleton() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2.5 mb-6">
          <CalendarClock className="w-5 h-5 text-muted-foreground" />
          <Skeleton className="h-6 w-44 bg-muted" />
        </div>
        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-4 w-20 bg-muted" />
                <Skeleton className="h-3 w-16 bg-muted" />
                <div className="flex-1 h-px bg-border/40" />
              </div>
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="flex-none w-[160px] sm:w-[175px]">
                    <Skeleton className="aspect-3/4 rounded-xl bg-muted mb-2.5" />
                    <Skeleton className="h-4 w-full bg-muted mb-1.5" />
                    <Skeleton className="h-3 w-20 bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  const [bellActive, setBellActive] = useState(false);

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2.5 mb-6">
          <CalendarClock className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            Upcoming Releases
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border/20 bg-surface-elevated py-14 px-6">
          <div className="absolute inset-0 bg-linear-to-b from-primary/3 via-transparent to-primary/3" />

          <div className="absolute left-8 top-0 bottom-0 w-px bg-border/30 hidden sm:block" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute left-[29px] w-2.5 h-2.5 rounded-full border-2 border-border/30 bg-background hidden sm:block"
              style={{ top: `${20 + i * 22}%` }}
            />
          ))}

          <div className="relative flex flex-col items-center text-center">
            <button
              onClick={() => setBellActive((prev) => !prev)}
              className="relative mb-5 group cursor-pointer"
            >
              <div
                className={`absolute inset-0 rounded-full blur-xl transition-colors duration-500 ${
                  bellActive
                    ? "bg-primary/20 scale-125"
                    : "bg-muted/30 animate-pulse"
                }`}
              />
              <div
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  bellActive
                    ? "bg-primary/10 border-2 border-primary/30"
                    : "bg-muted/40 border-2 border-border/20 group-hover:border-primary/20"
                }`}
              >
                {bellActive ? (
                  <BellRing className="w-7 h-7 text-primary animate-[wiggle_0.5s_ease-in-out]" />
                ) : (
                  <Bell className="w-7 h-7 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                )}
              </div>
            </button>

            <h3 className="text-base font-semibold text-foreground mb-1.5">
              {bellActive
                ? "You're all caught up!"
                : "No upcoming releases scheduled"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {bellActive
                ? "When new chapters are scheduled, they'll appear here. Keep reading in the meantime!"
                : "There are no scheduled chapter releases right now. Tap the bell to check back later, or browse our catalog."}
            </p>

            <Link
              href={allSeries}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Browse series
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReleaseCard({ release }: { release: UpcomingReleaseResponse }) {
  return (
    <Link
      href={`${allSeries}/${release.seriesSlug}`}
      className="group flex-none w-[160px] sm:w-[175px] pr-4"
    >
      <div className="relative aspect-3/4 rounded-xl overflow-hidden mb-2.5">
        {release.seriesImage ? (
          <Image
            src={release.seriesImage}
            alt={release.seriesName}
            fill
            sizes="175px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
            <span className="text-muted-foreground/40 text-xs">No Cover</span>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">
          Ch. {release.nextChapterNumber}
          {release.chaptersInNextBatch > 1 && `–${release.nextChapterNumber + release.chaptersInNextBatch - 1}`}
        </div>

        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded">
          {release.releasesIn}
        </div>
      </div>

      <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
        {release.seriesName}
      </h3>

      {release.isEstimate && (
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
            Estimated
          </span>
          <Tooltip>
            <TooltipTrigger asChild onClick={(e) => e.preventDefault()}>
              <Info className="w-3 h-3 text-amber-500/70 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top">
              This release date is an estimate based on the series&apos; usual schedule and may change.
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BookOpen className="w-3 h-3" />
        <span>Ch. {release.nextChapterNumber}</span>
        <span className="text-muted-foreground/30">·</span>
        <span className="capitalize">{release.novelType}</span>
      </div>
    </Link>
  );
}

export default function UpcomingReleases() {
  const [releases, setReleases] = useState<UpcomingReleaseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const result = await getUpcomingReleasesAction();
        if (result.success && result.data) {
          setReleases(result.data);
        } else {
          setError(result.error || "Failed to fetch upcoming releases");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  if (loading) return <UpcomingReleasesSkeleton />;
  if (error || releases.length === 0) return <EmptyState />;

  const grouped = releases.reduce<
    Record<string, { label: string; releases: UpcomingReleaseResponse[] }>
  >((acc, release) => {
    const dateKey = release.nextReleaseAt.split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = { label: release.releasesIn, releases: [] };
    }
    acc[dateKey].releases.push(release);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2.5 mb-6">
          <CalendarClock className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            Upcoming Releases
          </h2>
        </div>

        <div className="space-y-8">
          {sortedDates.map((date) => {
            const { label, releases: dateReleases } = grouped[date];
            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-semibold text-primary">
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {dateReleases.length}{" "}
                    {dateReleases.length === 1 ? "release" : "releases"}
                  </span>
                  <div className="flex-1 h-px bg-border/40" />
                </div>
                <Carousel>
                  {dateReleases.map((release) => (
                    <ReleaseCard key={release.seriesId} release={release} />
                  ))}
                </Carousel>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
