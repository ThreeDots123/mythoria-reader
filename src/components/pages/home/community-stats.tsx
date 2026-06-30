"use client";

import { BookOpen, Users, Layers, PenTool, Share2 } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
}

const stats: Stat[] = [
  {
    label: "Chapters Read Today",
    value: "12.4K",
    subtext: "+18% from yesterday",
    icon: BookOpen,
  },
  {
    label: "Active Readers",
    value: "1,247",
    subtext: "Online right now",
    icon: Users,
  },
  {
    label: "New Chapters",
    value: "47",
    subtext: "Published this week",
    icon: Layers,
  },
  {
    label: "Series on Platform",
    value: "320+",
    subtext: "Across 15 genres",
    icon: PenTool,
  },
];

export default function CommunityStats() {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={cn(
                    "flex flex-col items-center text-center px-4 py-6 md:py-8",
                    index < stats.length - 1 && "border-r border-border/20",
                    index === 1 && "border-r-0 md:border-r",
                    index < 2 && "border-b md:border-b-0 border-border/20",
                  )}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-sm text-foreground/80 font-medium mt-1">
                    {stat.label}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {stat.subtext}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="relative border-t border-border/20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <FaDiscord className="w-5 h-5 text-[#5865F2]" />
              <span>
                Join <span className="text-foreground font-medium">2,400+</span> readers in our community
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "Mythoria", text: "Check out Mythoria — read web novels for free!", url: window.location.origin });
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                  }
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share with Friends
              </button>
              <a
                href="https://discord.gg/HxKaU5j8qU"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#5865F2] text-white hover:bg-[#4752C4] transition-colors"
              >
                <FaDiscord className="w-4 h-4" />
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
