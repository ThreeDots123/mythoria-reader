"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ScrollNext, ScrollPrevious } from "./scroll-buttons";
import { cn } from "@/lib/utils";

export default function Carousel({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    dragFree: false,
    skipSnaps: false,
    inViewThreshold: 1.0,
  });

  const [previousBtnDisabled, setPreviousBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);

  const scrollPrevious = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPreviousBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="embla mx-auto" ref={emblaRef}>
        <div className="embla__container">{children}</div>
      </div>

      {/* Edge fade masks */}
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10 transition-opacity duration-300",
          previousBtnDisabled ? "opacity-0" : "opacity-100",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10 transition-opacity duration-300",
          nextBtnDisabled ? "opacity-0" : "opacity-100",
        )}
      />

      <ScrollPrevious
        onClick={scrollPrevious}
        disabled={previousBtnDisabled}
        className="absolute left-10 top-1/2 -translate-1/2 z-20"
      />
      <ScrollNext
        onClick={scrollNext}
        disabled={nextBtnDisabled}
        className="absolute right-1 top-1/2 -translate-1/2 z-20"
      />
    </div>
  );
}
