"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Lock,
  Settings2,
  Sun,
  AlignJustify,
  X,
  Minus,
  Plus,
  Type,
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { getChapterBySlugAction } from "@/server-actions/series";
import {
  bookmarkSeriesAction,
  removeBookmarkAction,
  checkBookmarkAction,
} from "@/server-actions/bookmark";
import { setLastReadChapterAction } from "@/server-actions/reading-progress";
import { ChapterReaderResponse } from "@/api/types";
import { allSeries, login as loginRoute } from "@/routes/client";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CommentSection from "@/components/comment/comment-section";
import { ContentTeaser } from "@/components/shared/content-teaser";
import { InlinePurchaseModal } from "@/components/shared/inline-purchase-modal";
import { CoinValueBadge } from "@/components/shared/coin-value-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import MagicRenderer from "./global/magic-tags/renderer";

type ReadingTheme = "light" | "sepia" | "dark" | "midnight";

const themeStyles: Record<ReadingTheme, { article: string; page: string }> = {
  light: {
    article:
      "bg-white text-gray-900 prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900",
    page: "bg-gray-100",
  },
  sepia: {
    article:
      "bg-[#f4ecd8] text-[#5b4636] prose-headings:text-[#3e2c1c] prose-p:text-[#5b4636] prose-strong:text-[#3e2c1c]",
    page: "bg-[#e8dcc8]",
  },
  dark: {
    article:
      "bg-[#1e1e1e] text-gray-200 prose-headings:text-gray-100 prose-p:text-gray-300 prose-strong:text-gray-100 prose-invert",
    page: "bg-[#161616]",
  },
  midnight: {
    article:
      "bg-[#0d1117] text-gray-200 prose-headings:text-gray-50 prose-p:text-gray-300 prose-strong:text-gray-50 prose-invert",
    page: "bg-[#080b10]",
  },
};

const themeConfig: { value: ReadingTheme; label: string; bg: string }[] = [
  { value: "light", label: "Light", bg: "bg-white" },
  { value: "sepia", label: "Sepia", bg: "bg-[#f4ecd8]" },
  { value: "dark", label: "Dark", bg: "bg-[#1e1e1e]" },
  { value: "midnight", label: "Night", bg: "bg-[#0d1117]" },
];

function useReadingProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const elTop = window.scrollY + rect.top;
      const elHeight = rect.height;
      const scrolled = window.scrollY - elTop;
      const viewportHeight = window.innerHeight;
      const readable = elHeight - viewportHeight;

      if (readable <= 0) {
        setProgress(scrolled >= 0 ? 100 : 0);
      } else {
        setProgress(Math.min(Math.max((scrolled / readable) * 100, 0), 100));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [ref]);

  return progress;
}

function ChapterReaderSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b bg-background/80 border-border/30">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
          <Skeleton className="h-4 w-24 bg-muted" />
          <Skeleton className="h-4 w-16 bg-muted" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md bg-muted" />
            <Skeleton className="h-8 w-8 rounded-md bg-muted" />
            <Skeleton className="h-8 w-8 rounded-md bg-muted" />
          </div>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-6">
        <div className="pt-10 pb-8 border-b border-border/20 mb-10">
          <Skeleton className="h-8 w-48 bg-muted mb-2" />
          <Skeleton className="h-5 w-64 bg-muted" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4 bg-muted"
              style={{ width: `${70 + Math.random() * 30}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChapterReaderPage({
  params,
}: {
  params: { slug: string; chapter: string };
}) {
  const urlParams = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = (urlParams?.slug || params?.slug) as string;
  const chapterNum = parseInt(
    (urlParams?.chapter || params?.chapter) as string,
    10
  );

  const [chapterData, setChapterData] = useState<ChapterReaderResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fontSize, setFontSize] = useState(17);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>("midnight");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [floatingHeader, setFloatingHeader] = useState(false);

  const articleRef = useRef<HTMLElement>(null);
  const chapterHeadingRef = useRef<HTMLDivElement>(null);
  const progress = useReadingProgress(articleRef);

  useEffect(() => {
    if (!slug || isNaN(chapterNum)) return;

    const fetchChapter = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getChapterBySlugAction(slug, chapterNum);
        if (result.success && result.data) {
          setChapterData(result.data);
        } else {
          setError(result.error || "Failed to load chapter");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [slug, chapterNum]);

  // Track reading progress
  useEffect(() => {
    if (!chapterData || !user) return;
    setLastReadChapterAction(
      chapterData.series.id,
      chapterData.chapter.chapterNumber
    ).catch(() => {});
  }, [chapterData, user]);

  // Check bookmark status
  useEffect(() => {
    if (!chapterData || !user) return;
    checkBookmarkAction(chapterData.series.id)
      .then((result) => {
        if (result.success && result.data) {
          setIsBookmarked(result.data.isBookmarked);
        }
      })
      .catch(() => {});
  }, [chapterData, user]);

  useEffect(() => {
    const saved = localStorage.getItem("reader-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.lineHeight) setLineHeight(parsed.lineHeight);
        if (parsed.theme) setReadingTheme(parsed.theme);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "reader-settings",
      JSON.stringify({ fontSize, lineHeight, theme: readingTheme })
    );
  }, [fontSize, lineHeight, readingTheme]);

  useEffect(() => {
    const handleScroll = () => {
      if (!chapterHeadingRef.current) return;
      const rect = chapterHeadingRef.current.getBoundingClientRect();
      setFloatingHeader(rect.bottom < 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!chapterData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowLeft" && chapterData.prevChapter) {
        router.push(
          `${allSeries}/${slug}/chapter/${chapterData.prevChapter.chapterNumber}`
        );
      } else if (e.key === "ArrowRight" && chapterData.nextChapter) {
        router.push(
          `${allSeries}/${slug}/chapter/${chapterData.nextChapter.chapterNumber}`
        );
      } else if (e.key === "Escape" && fullscreen) {
        setFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chapterData, slug, router, fullscreen]);

  const handleBookmarkToggle = useCallback(async () => {
    if (!chapterData) return;
    if (!user) {
      router.push(loginRoute);
      return;
    }

    setIsBookmarking(true);
    try {
      const result = isBookmarked
        ? await removeBookmarkAction(chapterData.series.id)
        : await bookmarkSeriesAction(chapterData.series.id);

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
  }, [chapterData, user, isBookmarked, router]);

  const handleShare = async () => {
    if (!chapterData) return;
    const url = window.location.href;
    const title = `Chapter ${chapterData.chapter.chapterNumber} — ${
      chapterData.series?.title || ""
    }`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied!");
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  if (loading) return <ChapterReaderSkeleton />;

  if (error || !chapterData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Lock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">
            Chapter unavailable
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {error || "This chapter doesn't exist or couldn't be loaded."}
          </p>
          <Link
            href={`${allSeries}/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to series
          </Link>
        </div>
      </div>
    );
  }

  const { chapter, prevChapter, nextChapter, series } = chapterData;
  const isPremiumLocked = chapter.isPremium && !chapter.content;
  const currentTheme = themeStyles[readingTheme];

  const f = fullscreen;

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        f ? currentTheme.page : "bg-background"
      )}
    >
      {/* Reading progress — tracks article only */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating chapter info — appears when heading scrolls out */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-45 transition-all duration-200",
          floatingHeader && !settingsOpen
            ? "translate-y-12 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "backdrop-blur-xl border-b",
            f ? "bg-black/40 border-white/10" : "bg-card/90 border-border/30"
          )}
        >
          <div className="max-w-3xl mx-auto px-6 h-9 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-xs font-medium",
                f ? "text-white/70" : "text-muted-foreground"
              )}
            >
              Ch. {chapter.chapterNumber}
              {chapter.title && ` — ${chapter.title}`}
            </span>
            <span
              className={cn(
                "text-[10px]",
                f ? "text-white/40" : "text-muted-foreground/50"
              )}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300",
          f
            ? "bg-black/40 border-white/10"
            : "bg-background/80 border-border/30"
        )}
      >
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link
            href={`${allSeries}/${slug}`}
            className={cn(
              "flex items-center gap-1 text-sm transition-colors",
              f
                ? "text-white/50 hover:text-white/80"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline truncate max-w-[200px]">
              {series.title}
            </span>
            <span className="sm:hidden">Back</span>
          </Link>

          <span
            className={cn(
              "text-sm font-medium",
              f ? "text-white/80" : "text-foreground"
            )}
          >
            Ch. {chapter.chapterNumber}
          </span>

          <div className="flex items-center gap-0.5">
            <button
              onClick={handleBookmarkToggle}
              disabled={isBookmarking}
              className={cn(
                "p-2 rounded-md transition-colors disabled:opacity-50",
                isBookmarked
                  ? "text-primary"
                  : f
                  ? "text-white/50 hover:text-white/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isBookmarking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bookmark
                  className={cn("w-4 h-4", isBookmarked && "fill-current")}
                />
              )}
            </button>
            <button
              onClick={handleShare}
              className={cn(
                "p-2 rounded-md transition-colors",
                f
                  ? "text-white/50 hover:text-white/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFullscreen(!f)}
              className={cn(
                "p-2 rounded-md transition-colors",
                f
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={cn(
                "p-2 rounded-md transition-colors",
                settingsOpen
                  ? "text-primary"
                  : f
                  ? "text-white/50 hover:text-white/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {settingsOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Settings2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {settingsOpen && (
          <div
            className={cn(
              "border-t backdrop-blur-xl",
              f ? "bg-black/60 border-white/10" : "bg-card/95 border-border/20"
            )}
          >
            <div className="max-w-3xl mx-auto px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    f ? "text-white/60" : "text-muted-foreground"
                  )}
                >
                  <Type className="w-4 h-4" />
                  <span>Size</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFontSize(Math.max(13, fontSize - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span
                    className={cn(
                      "text-sm font-medium w-8 text-center",
                      f ? "text-white" : "text-foreground"
                    )}
                  >
                    {fontSize}
                  </span>
                  <button
                    onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    f ? "text-white/60" : "text-muted-foreground"
                  )}
                >
                  <AlignJustify className="w-4 h-4" />
                  <span>Spacing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[
                    { value: 1.5, label: "Tight" },
                    { value: 1.8, label: "Normal" },
                    { value: 2.0, label: "Relaxed" },
                    { value: 2.2, label: "Loose" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setLineHeight(opt.value)}
                      className={cn(
                        "text-xs px-2.5 py-1.5 rounded-md border transition-colors",
                        lineHeight === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    f ? "text-white/60" : "text-muted-foreground"
                  )}
                >
                  <Sun className="w-4 h-4" />
                  <span>Theme</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {themeConfig.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setReadingTheme(t.value)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        t.bg,
                        readingTheme === t.value
                          ? "border-primary scale-110"
                          : "border-border/40 hover:border-border"
                      )}
                      title={t.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-3xl mx-auto px-6">
        {/* Chapter heading */}
        <div
          ref={chapterHeadingRef}
          className={cn(
            "pt-10 pb-8 border-b mb-10 transition-colors duration-300",
            f
              ? "border-white/10 bg-black/60 backdrop-blur-xl -mx-6 px-6 rounded-b-lg"
              : "border-border/20"
          )}
        >
          <h1
            className={cn(
              "text-2xl sm:text-3xl font-bold mb-1 transition-colors duration-300",
              f ? "text-white" : "text-foreground"
            )}
          >
            Chapter {chapter.chapterNumber}
          </h1>
          {chapter.title && (
            <h2
              className={cn(
                "text-lg transition-colors duration-300",
                f ? "text-white/60" : "text-muted-foreground"
              )}
            >
              {chapter.title}
            </h2>
          )}
        </div>

        {/* Premium lock */}
        {isPremiumLocked && (
          <div className="mb-12">
            <ContentTeaser className="mb-0" />
            <div className="relative -mt-6 p-6 md:p-8 rounded-xl bg-card/80 backdrop-blur-sm border border-border/30 text-center">
              <Lock className="w-8 h-8 text-coin-gold mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">
                Premium Chapter
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Unlock this chapter to continue reading
              </p>
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="text-sm text-muted-foreground">
                  Unlock for
                </span>
                <CoinValueBadge coins={chapter.priceInCoins || 20} size="lg" />
              </div>
              <button
                onClick={() => setPurchaseModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-linear-to-r from-primary to-secondary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                <Lock className="w-4 h-4" />
                Unlock Chapter
              </button>
            </div>
            <InlinePurchaseModal
              open={purchaseModalOpen}
              onOpenChange={setPurchaseModalOpen}
              chapterId={chapter.id}
              chapterNumber={chapter.chapterNumber}
              priceInCoins={chapter.priceInCoins || 20}
              seriesTitle={series.title}
              onPurchaseSuccess={() => {}}
            />
          </div>
        )}

        {/* Article */}
        {!isPremiumLocked && (
          <article
            ref={articleRef}
            className={cn(
              "prose max-w-none rounded-lg p-5 md:p-8 mb-8 transition-colors duration-300",
              currentTheme.article
            )}
            style={{ fontSize: `${fontSize}px`, lineHeight }}
          >
            {chapter.content ? (
              <MagicRenderer
                content={chapter.content}
                readingTheme={
                  readingTheme === "light"
                    ? "light"
                    : readingTheme === "sepia"
                    ? "light-gray"
                    : readingTheme === "dark"
                    ? "dark-gray"
                    : "dark"
                }
              />
            ) : (
              <p className="text-muted-foreground">No content available.</p>
            )}
          </article>
        )}
      </div>

      {/* Sticky bottom nav */}
      {!isPremiumLocked && (
        <nav
          className={cn(
            "sticky bottom-0 z-30 backdrop-blur-xl border-t transition-colors duration-300",
            f ? "bg-black/60 border-white/10" : "bg-card/95 border-border/30"
          )}
          aria-label="Chapter navigation"
        >
          <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
            {prevChapter ? (
              <Link
                href={`${allSeries}/${slug}/chapter/${prevChapter.chapterNumber}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group min-w-0 flex-1",
                  f ? "hover:bg-white/10" : "hover:bg-muted/20"
                )}
              >
                <ChevronLeft
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    f
                      ? "text-white/50 group-hover:text-white"
                      : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[10px] uppercase tracking-wide",
                      f ? "text-white/40" : "text-muted-foreground/60"
                    )}
                  >
                    Prev
                  </p>
                  <p
                    className={cn(
                      "text-xs font-medium truncate",
                      f ? "text-white/80" : "text-foreground"
                    )}
                  >
                    Ch. {prevChapter.chapterNumber}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            <Link
              href={`${allSeries}/${slug}`}
              className={cn(
                "shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-md border transition-colors",
                f
                  ? "text-white/50 border-white/10 hover:text-white/80"
                  : "text-muted-foreground border-border/30 hover:text-foreground"
              )}
            >
              Series
            </Link>

            {nextChapter ? (
              <Link
                href={`${allSeries}/${slug}/chapter/${nextChapter.chapterNumber}`}
                className={cn(
                  "flex items-center justify-end gap-2 px-3 py-2 rounded-lg transition-colors group min-w-0 flex-1",
                  f ? "hover:bg-white/10" : "hover:bg-muted/20"
                )}
              >
                <div className="min-w-0 text-right">
                  <p
                    className={cn(
                      "text-[10px] uppercase tracking-wide",
                      f ? "text-white/40" : "text-muted-foreground/60"
                    )}
                  >
                    Next
                  </p>
                  <p
                    className={cn(
                      "text-xs font-medium truncate",
                      f ? "text-white/80" : "text-foreground"
                    )}
                  >
                    Ch. {nextChapter.chapterNumber}
                    {nextChapter.isPremium && (
                      <Lock className="inline w-2.5 h-2.5 ml-1 text-coin-gold" />
                    )}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    f
                      ? "text-white/50 group-hover:text-white"
                      : "text-muted-foreground group-hover:text-primary"
                  )}
                />
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </nav>
      )}

      {/* Comments — hidden in fullscreen */}
      {!isPremiumLocked && chapter.id && (
        <div
          className={cn(
            "max-w-3xl mx-auto px-6 py-10 border-t border-border/20",
            f ? "hidden" : "block"
          )}
        >
          <CommentSection chapterId={chapter.id} />
        </div>
      )}
    </div>
  );
}
