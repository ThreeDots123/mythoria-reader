"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import apiClientManager from "@/api/interface";
import { account } from "@/routes/client";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error";
  startDate: string;
  endDate: string | null;
}

const typeConfig = {
  info: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
    icon: Info,
  },
  success: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    icon: CheckCircle,
  },
  warning: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    iconColor: "text-orange-400",
    icon: AlertTriangle,
  },
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    iconColor: "text-red-400",
    icon: AlertCircle,
  },
};

export default function BannerComponent() {
  const pathname = usePathname();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await apiClientManager.getActiveAnnouncements();
        if (response.success) {
          setAnnouncements(response.data);
        }
      } catch {
        // silently fail
      }
    };
    fetchAnnouncements();
  }, []);

  const goNext = useCallback(() => {
    if (announcements.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  }, [announcements.length]);

  const goPrev = useCallback(() => {
    if (announcements.length <= 1) return;
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + announcements.length) % announcements.length
    );
  }, [announcements.length]);

  useEffect(() => {
    if (announcements.length <= 1 || paused) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [announcements.length, paused, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    const threshold = 50;
    if (touchDeltaX.current < -threshold) {
      goNext();
    } else if (touchDeltaX.current > threshold) {
      goPrev();
    }
    touchDeltaX.current = 0;
  };

  if (
    dismissed ||
    announcements.length === 0 ||
    pathname.startsWith(account)
  )
    return null;

  const safeIndex = currentIndex % announcements.length;
  const current = announcements[safeIndex];
  const config = typeConfig[current.type];
  const Icon = config.icon;
  const hasMultiple = announcements.length > 1;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div
      className={cn("border-b", config.bg, config.border)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative flex items-center gap-2 py-2.5 min-h-[40px]">
          {/* Left arrow */}
          {hasMultiple && (
            <button
              onClick={goPrev}
              className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Previous announcement"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Content area */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center gap-2"
              >
                <Icon
                  className={cn("w-4 h-4 shrink-0", config.iconColor)}
                />
                <p className="text-xs sm:text-sm text-foreground truncate">
                  {current.title && (
                    <span className="font-semibold">{current.title} — </span>
                  )}
                  <span className="text-muted-foreground">
                    {current.content}
                  </span>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: dots + arrow + close */}
          <div className="flex items-center gap-1.5 shrink-0">
            {hasMultiple && (
              <>
                <div className="hidden sm:flex items-center gap-1">
                  {announcements.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDirection(index > safeIndex ? 1 : -1);
                        setCurrentIndex(index);
                      }}
                      className={cn(
                        "rounded-full transition-all duration-300",
                        index === safeIndex
                          ? "w-4 h-1.5 bg-foreground/60"
                          : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                      aria-label={`Go to announcement ${index + 1}`}
                    />
                  ))}
                </div>

                <span className="text-[10px] text-muted-foreground sm:hidden">
                  {safeIndex + 1}/{announcements.length}
                </span>

                <button
                  onClick={goNext}
                  className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Next announcement"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors ml-1"
              aria-label="Dismiss announcements"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
