"use client";

import Image from "next/image";

export interface SeriesHeroProps {
  title: string;
  author: string;
  featuredImage: string | null;
}

export function SeriesHero({ title, author, featuredImage }: SeriesHeroProps) {
  return (
    <div className="relative h-64 md:h-80 overflow-hidden">
      {/* Full bleed background */}
      <div className="absolute inset-0">
        {featuredImage && (
          <Image
            src={featuredImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
            role="presentation"
          />
        )}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-end pb-8">
        <div>
          <p className="text-sm text-primary font-medium mb-2">by {author}</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight max-w-2xl">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
