"use client";

import { PiCoinsThin } from "react-icons/pi";
import { cn } from "@/lib/utils";

const COIN_TO_DOLLAR_RATE = 0.05;

interface CoinValueBadgeProps {
  coins: number;
  showDollarValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CoinValueBadge({
  coins,
  showDollarValue = false,
  size = "md",
  className,
}: CoinValueBadgeProps) {
  const dollarValue = (coins * COIN_TO_DOLLAR_RATE).toFixed(2);

  const sizeStyles = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold text-coin-gold",
        sizeStyles[size],
        className,
      )}
    >
      <PiCoinsThin className={iconSizes[size]} />
      <span>{coins}</span>
      {showDollarValue && (
        <span className="text-muted-foreground font-normal">
          (${dollarValue})
        </span>
      )}
    </span>
  );
}
