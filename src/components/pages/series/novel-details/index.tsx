"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { getSeriesDetailsAction } from "@/server-actions/series";
import {
  bookmarkSeriesAction,
  removeBookmarkAction,
  checkBookmarkAction,
} from "@/server-actions/bookmark";
import {
  likeSeriesAction,
  unlikeSeriesAction,
  checkLikeAction,
} from "@/server-actions/like";
import { getLastReadChapterAction } from "@/server-actions/reading-progress";
import { useAuth } from "@/contexts/auth-context";
import { login as loginRoute, allSeries, home } from "@/routes/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ReviewSection from "./review-section";
import CommentSection from "@/components/comment/comment-section";
import {
  SeriesDetailsResponse,
  SeriesDetailsChapterResponse,
} from "@/api/types";
import {
  ScrollText,
  CalendarClock,
  Info,
  BookX,
  Search,
  ArrowLeft,
  Compass,
} from "lucide-react";
import { ContentDialogDrawer } from "@/components/ui/content-dialog-drawer";
import { SeriesHero } from "./hero";
import { CoverAndActions } from "./cover-and-actions";
import { OverviewSection } from "./overview-section";
import { ChaptersSection } from "./chapters-section";
import { NovelDetailsSkeleton } from "./skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

function UpcomingReleaseBanner({
  release,
}: {
  release: NonNullable<SeriesDetailsResponse["upcomingRelease"]>;
}) {
  const releaseDate = new Date(release.nextReleaseAt);
  const now = new Date();
  const diffMs = releaseDate.getTime() - now.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  let timeLabel: string;
  if (diffMs <= 0) {
    timeLabel = "Any moment now";
  } else if (diffDays > 0) {
    timeLabel = `in ${diffDays}d ${remainingHours}h`;
  } else {
    timeLabel = `in ${diffHours}h`;
  }

  const chapterLabel =
    release.chaptersInNextBatch > 1
      ? `Ch. ${release.nextChapterNumber}–${release.nextChapterNumber + release.chaptersInNextBatch - 1}`
      : `Ch. ${release.nextChapterNumber}`;

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <CalendarClock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">
              Next Release
            </span>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
              {timeLabel}
            </span>
            {release.isEstimate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded cursor-help">
                    Estimated
                    <Info className="w-3 h-3 text-amber-500/70" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  This release date is an estimate based on the series&apos;
                  usual schedule and may change.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground">{chapterLabel}</span>
            {" · "}
            {releaseDate.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function SeriesNotFound({
  error,
  slug,
}: {
  error: string | null;
  slug: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(
    slug ? slug.replace(/-/g, " ") : ""
  );

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    toast.info("Search is not implemented yet");
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-64 md:h-72 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-destructive/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-muted/30 via-transparent to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-40 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Animated book icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 scale-150 bg-destructive/10 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-card border border-border/30 flex items-center justify-center shadow-xl">
              <BookX className="w-9 h-9 text-muted-foreground/60" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            This story hasn&apos;t been written yet
          </h1>

          <p className="text-muted-foreground max-w-md mb-8">
            {error ||
              "The series you're looking for doesn't exist or may have been removed. But there are thousands of other stories waiting for you."}
          </p>

          {/* Search bar */}
          <div className="w-full max-w-sm mb-6">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for a series..."
                className="w-full h-11 pl-10 pr-20 text-sm rounded-xl bg-card border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <button
                onClick={handleSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Action links */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
            <Link
              href={allSeries}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              <Compass className="w-4 h-4" />
              Browse all series
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function NovelDetailsComponent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const slug = params.slug as string;
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [series, setSeries] = useState<SeriesDetailsResponse | null>(null);
  const [chapters, setChapters] = useState<SeriesDetailsChapterResponse[]>([]);
  const [pagination, setPagination] = useState({
    totalChapters: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [lastReadChapter, setLastReadChapter] = useState<number | null>(null);
  const [chapterNumberInput, setChapterNumberInput] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const result = await getSeriesDetailsAction(slug, page, 20);
        if (result.success && result.data) {
          setSeries(result.data.series);
          setChapters(result.data.chapters);
          setPagination({
            totalChapters: result.data.totalChapters,
            page: result.data.page,
            limit: result.data.limit,
            totalPages: result.data.totalPages,
          });
        } else {
          setError(result.error || "Failed to load series details");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [slug, page]);

  useEffect(() => {
    if (!series || authLoading || !user) return;

    const fetchUserState = async () => {
      const [bookmarkResult, likeResult, readResult] = await Promise.all([
        checkBookmarkAction(series.id).catch(() => null),
        checkLikeAction(series.id).catch(() => null),
        getLastReadChapterAction(series.id).catch(() => null),
      ]);

      if (bookmarkResult?.success && bookmarkResult.data) {
        setIsBookmarked(bookmarkResult.data.isBookmarked);
      }
      if (likeResult?.success && likeResult.data) {
        setIsLiked(likeResult.data.isLiked);
      }
      if (readResult?.success && readResult.data != null) {
        setLastReadChapter(readResult.data);
      }
    };

    fetchUserState();
  }, [series, user, authLoading]);

  const handleBookmarkToggle = useCallback(async () => {
    if (!series) return;
    if (!user) {
      router.push(loginRoute);
      return;
    }

    setIsBookmarking(true);
    try {
      const result = isBookmarked
        ? await removeBookmarkAction(series.id)
        : await bookmarkSeriesAction(series.id);

      if (result.success) {
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? "Bookmark removed" : "Series bookmarked");
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsBookmarking(false);
    }
  }, [series, user, isBookmarked, router]);

  const handleLikeToggle = useCallback(async () => {
    if (!series) return;
    if (!user) {
      router.push(loginRoute);
      return;
    }

    setIsLiking(true);
    try {
      const result = isLiked
        ? await unlikeSeriesAction(series.id)
        : await likeSeriesAction(series.id);

      if (result.success) {
        setIsLiked(!isLiked);
        toast.success(isLiked ? "Like removed" : "Series liked");
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLiking(false);
    }
  }, [series, user, isLiked, router]);

  const handleReadChapter = () => {
    if (!series || !chapterNumberInput) return;
    const num = parseInt(chapterNumberInput, 10);
    if (num >= 1 && num <= pagination.totalChapters) {
      router.push(`/series/${series.slug}/chapter/${num}`);
    }
  };

  if (loading) return <NovelDetailsSkeleton />;

  if (error || !series) {
    return <SeriesNotFound error={error} slug={slug} />;
  }

  return (
    <main className="min-h-screen bg-background">
      <SeriesHero
        title={series.title}
        author={series.author}
        featuredImage={series.featuredImage}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-5 relative z-10">
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <div>
            <CoverAndActions
              series={series}
              chaptersLength={chapters.length}
              lastReadChapter={lastReadChapter}
              isBookmarked={isBookmarked}
              isBookmarking={isBookmarking}
              isLiked={isLiked}
              isLiking={isLiking}
              onBookmarkToggle={handleBookmarkToggle}
              onLikeToggle={handleLikeToggle}
            />
          </div>

          {/* Main content */}
          <div className="pt-2">
            {/* Genre + meta chips */}
            {(() => {
              const allTags = [
                ...series.categories,
                series.novelType,
                series.originalLanguage,
              ];
              const maxVisible = 5;
              const visibleTags = showAllTags
                ? allTags
                : allTags.slice(0, maxVisible);
              const hiddenCount = allTags.length - maxVisible;

              return (
                <div className="flex flex-wrap gap-2 mb-6">
                  {visibleTags.map((tag, i) => (
                    <span
                      key={`${tag}-${i}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border/30 text-muted-foreground bg-card/50"
                    >
                      {tag}
                    </span>
                  ))}
                  {hiddenCount > 0 && (
                    <button
                      onClick={() => setShowAllTags(!showAllTags)}
                      className="text-xs font-medium text-primary hover:text-primary/80 px-2 py-1.5 transition-colors"
                    >
                      {showAllTags ? "Show less" : `+${hiddenCount} more`}
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Translator credit */}
            {series.translatorName && (
              <p className="text-sm text-muted-foreground mb-6">
                Translated by{" "}
                <span className="text-foreground font-medium">
                  {series.translatorName}
                </span>
              </p>
            )}

            {/* Upcoming release */}
            {series.upcomingRelease && (
              <UpcomingReleaseBanner release={series.upcomingRelease} />
            )}

            {/* Prologue */}
            {series.prologue && (
              <div className="mb-6">
                <ContentDialogDrawer
                  triggerLabel="Read prologue"
                  title="Prologue"
                  contentHtml={series.prologue}
                  triggerIcon={
                    <ScrollText className="h-5 w-5 shrink-0 text-primary" />
                  }
                />
              </div>
            )}

            {/* Overview */}
            <OverviewSection description={series.description || ""} />

            {/* Rating summary */}
            <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-card/50 border border-border/20">
              <div className="text-center">
                <span className="text-3xl font-bold text-primary">
                  {series.averageRating > 0
                    ? series.averageRating.toFixed(1)
                    : "N/A"}
                </span>
                <span className="text-sm text-muted-foreground">/10</span>
              </div>
              <div className="flex-1">
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor((series.averageRating || 0) / 2)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {series.totalRatings > 0
                    ? `Based on ${series.totalRatings.toLocaleString()} ratings`
                    : "No ratings yet"}
                </p>
              </div>
            </div>

            {/* Rate this series */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Rate This Series
              </h2>
              <ReviewSection
                seriesId={series.id}
                onRatingUpdate={() => {}}
              />
            </div>

            {/* Chapters */}
            <ChaptersSection
              seriesSlug={series.slug}
              chapters={chapters}
              totalChapters={pagination.totalChapters}
              page={pagination.page}
              totalPages={pagination.totalPages}
              chapterNumberInput={chapterNumberInput}
              onChapterNumberChange={setChapterNumberInput}
              onReadChapter={handleReadChapter}
            />
          </div>
        </div>

        {/* Comments — full width below the grid */}
        <div className="mt-12 pb-16">
          <CommentSection seriesId={series.id} />
        </div>
      </div>
    </main>
  );
}
