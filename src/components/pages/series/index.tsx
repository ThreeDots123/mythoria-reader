"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SeriesFilter from "./filter";
import NovelCard from "./novel-card";
import ApplicationPagination from "@/components/utility/pagination";
import { getAllSeriesAction } from "@/server-actions/series";
import { AllSeriesResponse } from "@/api/types";
import { Skeleton } from "@/components/ui/skeleton";

function AllSeriesSkeleton() {
  return (
    <div className="min-h-[360px] grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-8 mt-10">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-3/4 rounded-xl bg-muted mb-3" />
          <Skeleton className="h-4 w-3/4 bg-muted mb-2" />
          <Skeleton className="h-3 w-1/2 bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default function AllSeries() {
  const searchParams = useSearchParams();
  const [series, setSeries] = useState<AllSeriesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 1,
  });

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      setError(null);
      try {
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "24", 10);
        const status = searchParams.get("status");
        const novelType = searchParams.get("novelType");
        const categories = searchParams.get("categories");
        const search = searchParams.get("search");
        const sort = searchParams.get("sort");
        const chapters = searchParams.get("chapters");

        const filters: {
          status?: string[];
          novelType?: string[];
          categories?: string[];
          search?: string;
          sort?: string;
          chapters?: string;
        } = {};
        if (status) filters.status = status.split(",");
        if (novelType) filters.novelType = novelType.split(",");
        if (categories) filters.categories = categories.split(",");
        if (search) filters.search = search;
        if (sort) filters.sort = sort;
        if (chapters) filters.chapters = chapters;

        const result = await getAllSeriesAction(page, limit, filters);
        if (result.success && result.data) {
          setSeries(result.data.data);
          setPagination({
            total: result.data.total,
            page: result.data.page,
            limit: result.data.limit,
            totalPages: result.data.totalPages,
          });
        } else {
          setError(result.error || "Failed to fetch series");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-16 py-3">
      <SeriesFilter />

      {loading ? (
        <AllSeriesSkeleton />
      ) : error ? (
        <div className="min-h-[360px] flex items-center justify-center mt-10">
          <p className="text-muted-foreground">{error}</p>
        </div>
      ) : series.length === 0 ? (
        <div className="min-h-[360px] flex items-center justify-center mt-10">
          <p className="text-muted-foreground">No series found.</p>
        </div>
      ) : (
        <>
          <div className="min-h-[360px] grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-8 mt-10">
            {series.map((novel) => (
              <NovelCard key={novel.id} series={novel} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-10">
              <ApplicationPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                basePath="/series"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
