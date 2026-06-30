"use client";

import { useState, useEffect } from "react";
import { Star, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { rateSeriesAction, getUserRatingAction } from "@/server-actions/series";
import { toast } from "sonner";
import { login } from "@/routes/client";
import { useRouter, usePathname } from "next/navigation";

interface ReviewSectionProps {
  seriesId: string;
  onRatingUpdate?: () => void;
}

export default function ReviewSection({
  seriesId,
  onRatingUpdate,
}: ReviewSectionProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUserRating, setLoadingUserRating] = useState(true);

  useEffect(() => {
    if (isAuthenticated && seriesId) {
      loadUserRating();
    } else {
      setLoadingUserRating(false);
    }
  }, [isAuthenticated, seriesId]);

  const loadUserRating = async () => {
    try {
      setLoadingUserRating(true);
      const result = await getUserRatingAction(seriesId);
      if (result.success) {
        setUserRating(result.data.rating);
      }
    } catch (error) {
      console.error("Failed to load user rating:", error);
    } finally {
      setLoadingUserRating(false);
    }
  };

  const handleRatingClick = async (rating: number) => {
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname || "");
      router.push(`${login}?redirect=${redirect}`);
      return;
    }

    setLoading(true);
    try {
      const result = await rateSeriesAction(seriesId, rating);
      if (result.success) {
        setUserRating(rating);
        toast.success(result.data.message || "Rating submitted successfully!");
        if (onRatingUpdate) {
          onRatingUpdate();
        }
      } else {
        toast.error(result.error || "Failed to submit rating");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoveredRating ?? userRating ?? 0;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/20">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-6 h-6 fill-muted text-muted" />
          ))}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            Sign in to rate this series
          </p>
        </div>
        <button
          onClick={() => {
            const redirect = encodeURIComponent(pathname || "");
            router.push(`${login}?redirect=${redirect}`);
          }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/20">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
            disabled={loading || loadingUserRating}
            className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= displayRating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted"
              }`}
            />
          </button>
        ))}
      </div>
      <div className="flex-1">
        {userRating ? (
          <p className="text-sm text-foreground">
            Your rating: <span className="font-semibold text-amber-400">{userRating}/5</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tap a star to rate
          </p>
        )}
        {loading && (
          <p className="text-xs text-muted-foreground mt-0.5">Submitting...</p>
        )}
      </div>
    </div>
  );
}
