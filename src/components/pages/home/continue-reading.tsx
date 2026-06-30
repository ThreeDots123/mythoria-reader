"use client";

import { BookOpen, ChevronRight, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { allSeries, login } from "@/routes/client";
import { OngoingSeriesItem } from "@/api/types";
import { getOngoingSeriesAction } from "@/server-actions/reading-progress";
import Carousel from "@/components/utility/carousel";
import { Skeleton } from "@/components/ui/skeleton";

const statusStyles: Record<string, { label: string; className: string }> = {
  ongoing: {
    label: "Ongoing",
    className: "bg-emerald-500/10 text-emerald-500",
  },
  completed: { label: "Completed", className: "bg-blue-500/10 text-blue-500" },
  hiatus: { label: "Hiatus", className: "bg-amber-500/10 text-amber-500" },
  dropped: { label: "Dropped", className: "bg-red-500/10 text-red-500" },
};

function ContinueReadingSkeleton() {
  return (
    <section>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen size={22} className="text-muted-foreground" />
          <Skeleton className="h-6 w-44 bg-muted" />
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-none w-[260px] sm:w-[280px]">
              <div className="flex gap-3 p-3 rounded-xl border border-border/30 bg-surface-elevated">
                <Skeleton className="shrink-0 w-16 h-22 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2 py-0.5">
                  <Skeleton className="h-4 w-full bg-muted" />
                  <Skeleton className="h-3 w-20 bg-muted" />
                  <Skeleton className="h-1.5 w-full rounded-full bg-muted mt-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ContinueReading() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [series, setSeries] = useState<OngoingSeriesItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const fetchOngoing = async () => {
      try {
        const result = await getOngoingSeriesAction();
        if (result.success && result.data) {
          setSeries(result.data);
        }
      } catch {
        // silently fail on home page
      } finally {
        setLoading(false);
      }
    };
    fetchOngoing();
  }, [isAuthenticated, authLoading]);

  if (!isAuthenticated && !authLoading) {
    return (
      <section>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 rounded-xl border border-border/30 bg-card/50 p-4 sm:p-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Pick up where you left off
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sign in to track your reading progress and continue your novels
              </p>
            </div>
            <Link
              href={login}
              className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (authLoading || loading) return <ContinueReadingSkeleton />;

  if (series.length === 0) {
    return (
      <section>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen size={22} className="text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Continue Reading
            </h2>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-border/20 bg-surface-elevated py-12 px-6">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5" />
            <div className="relative flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-14 h-20 rounded-lg bg-muted/40 border border-border/20"
                    style={{
                      transform: `rotate(${(i - 2) * 8}deg)`,
                      opacity: i === 2 ? 1 : 0.6,
                    }}
                  />
                ))}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                Your reading list is empty
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start reading any series and your progress will show up here.
                Read at least 3 chapters to add a series to your ongoing list.
              </p>
              <Link
                href={allSeries}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Discover novels
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen size={22} className="text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            Continue Reading
          </h2>
        </div>

        <Carousel>
          {series.map((item) => {
            const progress =
              item.totalChapters > 0
                ? Math.round(
                    (item.lastChapterNumber / item.totalChapters) * 100
                  )
                : 0;
            const nextChapter = item.lastChapterNumber + 1;
            const status = statusStyles[item.status] ?? {
              label: item.status,
              className: "bg-muted text-muted-foreground",
            };

            return (
              <Link
                key={item.seriesId}
                href={`/series/${item.slug}/chapter/${nextChapter}`}
                className="group flex-none w-[260px] sm:w-[280px] pr-4"
              >
                <div className="flex gap-3 p-3 rounded-xl border border-border/30 bg-surface-elevated hover:border-primary/30 transition-colors">
                  <div className="shrink-0 w-16 h-22 relative rounded-lg overflow-hidden">
                    {item.featuredImage ? (
                      <Image
                        src={item.featuredImage}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">
                          Ch. {item.lastChapterNumber} of {item.totalChapters}
                        </p>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-muted-foreground">
                          {progress}%
                        </span>
                        <span className="text-[11px] text-primary font-medium flex items-center gap-0.5">
                          Continue
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}
