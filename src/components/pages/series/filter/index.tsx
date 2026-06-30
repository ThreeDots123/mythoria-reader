"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, X, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const statusOptions = [
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on-hold" },
];

const novelTypeOptions = [
  { label: "Novel", value: "novel" },
  { label: "Manga", value: "manga" },
  { label: "Manhwa", value: "manhwa" },
];

const genreOptions = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Historical", "Horror", "Martial Arts", "Mystery", "Romance",
  "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

const sortOptions = [
  { label: "Latest Update", value: "latest" },
  { label: "Most Popular", value: "popular" },
  { label: "Highest Rated", value: "rating" },
  { label: "Title A-Z", value: "title-asc" },
  { label: "Newest Added", value: "newest" },
];

const chapterCountOptions = [
  { label: "Any", value: "" },
  { label: "1-50", value: "1-50" },
  { label: "50-200", value: "50-200" },
  { label: "200-500", value: "200-500" },
  { label: "500+", value: "500+" },
];

function ChipToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-transparent text-muted-foreground border-border/40 hover:border-border hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export default function SeriesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || []
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("novelType")?.split(",").filter(Boolean) || []
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || []
  );
  const [selectedSort, setSelectedSort] = useState(
    searchParams.get("sort") || "latest"
  );
  const [selectedChapters, setSelectedChapters] = useState(
    searchParams.get("chapters") || ""
  );
  const [showAllGenres, setShowAllGenres] = useState(false);

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];

  const activeCount =
    selectedStatus.length +
    selectedTypes.length +
    selectedGenres.length +
    (selectedChapters ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (selectedStatus.length) params.set("status", selectedStatus.join(","));
    if (selectedTypes.length) params.set("novelType", selectedTypes.join(","));
    if (selectedGenres.length) params.set("categories", selectedGenres.join(","));
    if (selectedSort !== "latest") params.set("sort", selectedSort);
    if (selectedChapters) params.set("chapters", selectedChapters);
    params.set("page", "1");
    router.push(`/series?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    setSearch("");
    setSelectedStatus([]);
    setSelectedTypes([]);
    setSelectedGenres([]);
    setSelectedSort("latest");
    setSelectedChapters("");
    router.push("/series", { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const visibleGenres = showAllGenres ? genreOptions : genreOptions.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Search + sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search by title, genre, or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm rounded-lg bg-card border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
          />
        </form>

        {/* Sort dropdown */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              setTimeout(applyFilters, 0);
            }}
            className="h-10 pl-9 pr-8 text-sm rounded-lg bg-card border border-border/40 text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter chips */}
      <div className="space-y-4">
        {/* Status */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((opt) => (
              <ChipToggle
                key={opt.value}
                label={opt.label}
                active={selectedStatus.includes(opt.value)}
                onClick={() => {
                  setSelectedStatus(toggleArrayItem(selectedStatus, opt.value));
                }}
              />
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Type
          </p>
          <div className="flex flex-wrap gap-2">
            {novelTypeOptions.map((opt) => (
              <ChipToggle
                key={opt.value}
                label={opt.label}
                active={selectedTypes.includes(opt.value)}
                onClick={() => {
                  setSelectedTypes(toggleArrayItem(selectedTypes, opt.value));
                }}
              />
            ))}
          </div>
        </div>

        {/* Genre */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Genre
          </p>
          <div className="flex flex-wrap gap-2">
            {visibleGenres.map((genre) => (
              <ChipToggle
                key={genre}
                label={genre}
                active={selectedGenres.includes(genre)}
                onClick={() => {
                  setSelectedGenres(toggleArrayItem(selectedGenres, genre));
                }}
              />
            ))}
            {genreOptions.length > 8 && (
              <button
                onClick={() => setShowAllGenres(!showAllGenres)}
                className="text-xs font-medium text-primary hover:text-primary/80 px-2 py-1.5 transition-colors"
              >
                {showAllGenres ? "Show less" : `+${genreOptions.length - 8} more`}
              </button>
            )}
          </div>
        </div>

        {/* Chapter count */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Chapters
          </p>
          <div className="flex flex-wrap gap-2">
            {chapterCountOptions.map((opt) => (
              <ChipToggle
                key={opt.value}
                label={opt.label}
                active={selectedChapters === opt.value}
                onClick={() => {
                  setSelectedChapters(
                    selectedChapters === opt.value ? "" : opt.value
                  );
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={applyFilters}
          className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Apply Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-primary-foreground text-primary rounded-full">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
