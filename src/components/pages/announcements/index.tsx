"use client";

import { useEffect, useState } from "react";
import {
  Megaphone,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  CalendarDays,
} from "lucide-react";
import apiClientManager from "@/api/interface";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error";
  startDate: string;
  endDate: string | null;
}

const typeConfig: Record<
  Announcement["type"],
  {
    icon: typeof Info;
    label: string;
    iconBg: string;
    iconColor: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  info: {
    icon: Info,
    label: "Info",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/20",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-500",
  },
  success: {
    icon: CheckCircle,
    label: "Update",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    label: "Notice",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-400",
    borderColor: "border-orange-500/20",
    badgeBg: "bg-orange-500/10",
    badgeText: "text-orange-500",
  },
  error: {
    icon: AlertCircle,
    label: "Important",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    borderColor: "border-red-500/20",
    badgeBg: "bg-red-500/10",
    badgeText: "text-red-500",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function AnnouncementsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/20 bg-card/50 p-5"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="w-9 h-9 rounded-lg bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 bg-muted" />
              <Skeleton className="h-3 w-full bg-muted" />
              <Skeleton className="h-3 w-3/4 bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const config = typeConfig[announcement.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/50 p-5 transition-colors hover:bg-card/80",
        config.borderColor
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "shrink-0 rounded-lg p-2 mt-0.5",
            config.iconBg
          )}
        >
          <Icon className={cn("w-5 h-5", config.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="text-sm font-semibold text-foreground">
              {announcement.title}
            </h3>
            <span
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide",
                config.badgeBg,
                config.badgeText
              )}
            >
              {config.label}
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {announcement.content}
          </p>

          <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground/60">
            <CalendarDays className="w-3 h-3" />
            <span>{formatDate(announcement.startDate)}</span>
            {announcement.endDate && (
              <>
                <span className="mx-1">—</span>
                <span>{formatDate(announcement.endDate)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await apiClientManager.getActiveAnnouncements();
        if (response.success) {
          setAnnouncements(response.data);
        } else {
          setError(response.error.message);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2.5 mb-8">
        <Megaphone className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
      </div>

      {loading ? (
        <AnnouncementsSkeleton />
      ) : error ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">{error}</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 scale-150 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative w-16 h-16 rounded-2xl bg-card border border-border/30 flex items-center justify-center">
              <Megaphone className="w-7 h-7 text-muted-foreground/40" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1.5">
            No announcements
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            There are no active announcements right now. Check back later for
            updates and news.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
            />
          ))}
        </div>
      )}
    </div>
  );
}
