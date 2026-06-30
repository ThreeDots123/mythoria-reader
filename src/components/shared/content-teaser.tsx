"use client";

import { cn } from "@/lib/utils";

interface ContentTeaserProps {
  className?: string;
}

const PLACEHOLDER_LINES = [
  "The silence stretched between them like a taut wire, vibrating with unspoken words that neither dared to voice. In the dim light of the chamber, shadows danced across weathered stone walls, casting strange patterns that seemed almost alive.",
  "With each passing moment, the weight of their decision grew heavier. There would be no turning back from this path — they both understood that much. The ancient texts had warned of consequences, but desperation had driven them far beyond the boundaries of caution.",
  "A distant rumble echoed through the corridors, followed by an eerie stillness that made the hairs on the back of their necks stand on end. Something had changed. Something fundamental had shifted in the very fabric of the world around them.",
  "The revelation hit like a thunderbolt, shattering every assumption they had carefully constructed over the past months. Everything they believed, everything they had fought for, now hung in a precarious balance between truth and devastating illusion.",
];

export function ContentTeaser({ className }: ContentTeaserProps) {
  return (
    <div className={cn("relative select-none", className)}>
      <div className="space-y-4" aria-hidden="true">
        {PLACEHOLDER_LINES.map((line, i) => (
          <p
            key={i}
            className="text-foreground/80 leading-relaxed"
            style={{
              filter: `blur(${4 + i * 1.5}px)`,
              opacity: 1 - i * 0.15,
            }}
          >
            {line}
          </p>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
    </div>
  );
}
