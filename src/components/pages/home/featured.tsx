"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, StarIcon, Eye, Flame } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedSeriesAction } from "@/server-actions/series";
import { FeaturedSeriesResponse } from "@/api/types";
import { cn } from "@/lib/utils";

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function FeaturedSkeleton() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <Skeleton className="w-full aspect-21/9 rounded-2xl bg-muted" />
      </div>
    </section>
  );
}

export default function Featured() {
  const [series, setSeries] = useState<FeaturedSeriesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const result = await getFeaturedSeriesAction();
        if (result.success && result.data) {
          setSeries(result.data);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const goNext = useCallback(() => {
    setSeries((s) => {
      setActiveIndex((prev) => (prev + 1) % s.length);
      return s;
    });
  }, []);

  useEffect(() => {
    if (series.length <= 1 || paused) return;
    const interval = setInterval(goNext, 8000);
    return () => clearInterval(interval);
  }, [series.length, goNext, paused]);

  if (loading) return <FeaturedSkeleton />;
  if (series.length === 0) return null;

  const current = series[activeIndex];

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="relative rounded-2xl overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Background cover image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              {current.featuredImage ? (
                <Image
                  src={current.featuredImage}
                  alt=""
                  fill
                  sizes="(max-width: 1280px) 100vw, 1220px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-card" />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-linear-to-r from-background via-background/95 to-background/40" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-background/60" />

          {/* Content */}
          <div className="relative flex flex-col justify-end min-h-[360px] md:min-h-[420px] p-6 md:p-10">
            <div className="max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id + "-info"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/15 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      <Flame className="w-3 h-3" />
                      Featured
                    </span>
                    {current.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="text-[11px] font-medium text-foreground/60 bg-foreground/10 backdrop-blur-sm px-2 py-1 rounded-md"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">
                    {current.title}
                  </h2>

                  {current.description && (
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-2 mb-5 max-w-lg">
                      {current.description.replace(/<[^>]*>/g, "")}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mb-5 text-sm">
                    {current.averageRating > 0 && (
                      <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                        <StarIcon className="w-4 h-4 fill-amber-400" />
                        {current.averageRating.toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      {formatViews(current.totalViews)}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      {current.chapterCount} Ch.
                    </span>
                  </div>

                  <Link href={`/series/${current.slug}`}>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary-hover gap-2 rounded-lg px-6 h-11">
                      <BookOpen className="w-4 h-4" />
                      Start Reading
                    </Button>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnail strip */}
            {series.length > 1 && (
              <div className="flex items-end gap-2 mt-8">
                {series.map((s, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "relative rounded-lg overflow-hidden transition-all duration-300 border-2",
                        isActive
                          ? "w-16 h-22 sm:w-20 sm:h-28 border-primary shadow-lg shadow-primary/20"
                          : "w-12 h-16 sm:w-14 sm:h-20 border-transparent opacity-50 hover:opacity-80"
                      )}
                    >
                      {s.featuredImage ? (
                        <Image
                          src={s.featuredImage}
                          alt={s.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                      {isActive && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-primary" />
                      )}
                    </button>
                  );
                })}

                <div className="hidden sm:flex flex-col justify-end ml-3 mb-1 gap-1">
                  <span className="text-[11px] text-muted-foreground">
                    {activeIndex + 1} of {series.length}
                  </span>
                  <div className="w-20 h-1 rounded-full bg-foreground/10 overflow-hidden">
                    {!paused && (
                      <motion.div
                        key={activeIndex}
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 8, ease: "linear" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
