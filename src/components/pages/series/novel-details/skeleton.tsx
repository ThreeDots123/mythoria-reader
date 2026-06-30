"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function NovelDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-96 bg-linear-to-b from-secondary/20 to-background overflow-hidden">
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="text-center w-full max-w-2xl space-y-4">
            <Skeleton className="h-4 w-32 mx-auto bg-muted" />
            <Skeleton className="h-12 w-full max-w-md mx-auto bg-muted" />
            <Skeleton className="h-6 w-48 mx-auto bg-muted" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Skeleton className="w-full aspect-3/4 rounded-lg mb-6 bg-muted" />
              <div className="space-y-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded bg-muted" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-16 bg-muted" />
                      <Skeleton className="h-4 w-12 bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-12 w-full rounded-lg bg-muted"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex flex-wrap gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  className="h-8 w-20 rounded-full bg-muted"
                />
              ))}
            </div>
            <div className="mb-12">
              <Skeleton className="h-8 w-32 mb-4 bg-muted" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-3/4 bg-muted" />
              </div>
            </div>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-10 w-16 bg-muted" />
                <Skeleton className="h-6 w-12 bg-muted" />
              </div>
            </div>
            <Skeleton className="h-8 w-40 mb-4 bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
