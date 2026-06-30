"use client";

import { ChevronLeft, ChevronRight, BookOpen, Eye, Heart } from "lucide-react";
import { useState } from "react";
import { mockCollections, formatViews } from "./mock-data";

export default function CuratedCollections() {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 5;

  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + visibleCount < mockCollections.length;

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✨</span>
            <h2 className="text-xl font-bold text-foreground">
              Curated Libraries
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStartIndex(Math.max(0, startIndex - 1))}
                disabled={!canGoBack}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setStartIndex(startIndex + 1)}
                disabled={!canGoForward}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              View All →
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {mockCollections
            .slice(startIndex, startIndex + visibleCount)
            .map((collection) => (
              <div
                key={collection.id}
                className="group rounded-xl border border-border/30 bg-surface-elevated p-5 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{collection.emoji}</span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {collection.name}
                    </h3>
                  </div>
                  <span className="ml-auto text-[10px] font-bold bg-destructive/20 text-destructive px-2 py-0.5 rounded shrink-0">
                    {collection.badge}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                  {collection.description}
                </p>

                {collection.genres.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-4">
                    {collection.genres.map((genre) => (
                      <span
                        key={genre}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-destructive/30 text-destructive"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border/20">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {collection.novelCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatViews(collection.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {collection.likes}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
