"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Unlock, ArrowRight } from "lucide-react";
import { PiCoinsThin } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuth } from "@/contexts/auth-context";
import { purchaseChapterAction } from "@/server-actions/purchase";
import { createCoinPurchaseOrderAction } from "@/server-actions/payment";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { login } from "@/routes/client";

const COIN_PLANS = [
  { id: 1, amount: 100, price: 5, chapters: 5, label: "Starter" },
  { id: 2, amount: 200, price: 10, chapters: 10, label: "Popular", recommended: true },
  { id: 3, amount: 500, price: 25, chapters: 25, label: "Best Value", savings: "Save 17%" },
  { id: 4, amount: 1000, price: 50, chapters: 50, label: "Power Reader", savings: "Save 17%" },
];

interface InlinePurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterId: string;
  chapterNumber: number;
  priceInCoins: number;
  seriesTitle: string;
  onPurchaseSuccess: () => void;
}

export function InlinePurchaseModal({
  open,
  onOpenChange,
  chapterId,
  chapterNumber,
  priceInCoins,
  seriesTitle,
  onPurchaseSuccess,
}: InlinePurchaseModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { user, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isBuyingCoins, setIsBuyingCoins] = useState<number | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  const balance = user?.coinBalance ?? 0;
  const hasEnough = balance >= priceInCoins;

  const handleUnlockChapter = async () => {
    if (!isAuthenticated) {
      router.push(`${login}?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsPurchasing(true);
    try {
      const result = await purchaseChapterAction(chapterId);
      if (result.success) {
        toast.success("Chapter unlocked!", { duration: 3000 });
        await refreshUser();
        onOpenChange(false);
        onPurchaseSuccess();
      } else {
        toast.error(result.error || "Failed to unlock chapter");
        if (result.error?.toLowerCase().includes("insufficient")) {
          setShowPlans(true);
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleBuyCoins = async (plan: (typeof COIN_PLANS)[number]) => {
    if (!isAuthenticated) {
      router.push(`${login}?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsBuyingCoins(plan.id);
    try {
      const result = await createCoinPurchaseOrderAction({
        coinAmount: plan.amount,
        amountPaid: plan.price,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to create order");
        setIsBuyingCoins(null);
        return;
      }

      if (result.data?.approvalUrl) {
        window.open(result.data.approvalUrl, "_blank");
        toast.info("Complete your payment in the new tab, then return here.", {
          duration: 10000,
        });
        onOpenChange(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsBuyingCoins(null);
    }
  };

  const content = (
    <div className="space-y-5">
      {/* Balance & Chapter Info */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-1">
          Chapter {chapterNumber} · {seriesTitle}
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <PiCoinsThin className="w-6 h-6 text-coin-gold" />
          <span className="text-2xl font-bold text-coin-gold">
            {priceInCoins}
          </span>
          <span className="text-muted-foreground text-sm">coins to unlock</span>
        </div>
        {isAuthenticated && (
          <p className="text-xs text-muted-foreground mt-2">
            Your balance:{" "}
            <span className={cn("font-semibold", hasEnough ? "text-primary" : "text-countdown-urgency")}>
              {balance} coins
            </span>
          </p>
        )}
      </div>

      {/* Direct Unlock (if enough coins) */}
      {isAuthenticated && hasEnough && !showPlans && (
        <Button
          onClick={handleUnlockChapter}
          disabled={isPurchasing}
          className="w-full bg-linear-to-r from-(--unlock-gradient-from) to-(--unlock-gradient-to) text-black font-semibold hover:opacity-90 h-12"
        >
          {isPurchasing ? (
            <>
              <Spinner className="mr-2 w-4 h-4" />
              Unlocking...
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4 mr-2" />
              Unlock Now · {priceInCoins} coins
            </>
          )}
        </Button>
      )}

      {/* Not enough coins or show plans */}
      {isAuthenticated && (!hasEnough || showPlans) && (
        <>
          {!hasEnough && (
            <div className="text-center rounded-lg bg-countdown-urgency/10 border border-countdown-urgency/20 p-3">
              <p className="text-sm text-countdown-urgency">
                You need {priceInCoins - balance} more coins
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Get Coins</p>
            {COIN_PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleBuyCoins(plan)}
                disabled={isBuyingCoins === plan.id}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                  plan.recommended
                    ? "border-coin-gold/50 bg-coin-gold/5"
                    : "border-border/40 bg-surface-elevated hover:border-border/60",
                  isBuyingCoins === plan.id && "opacity-50 cursor-not-allowed",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <PiCoinsThin className="w-5 h-5 text-coin-gold" />
                    <span className="font-semibold text-foreground">
                      {plan.amount}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-xs text-muted-foreground">
                      = {plan.chapters} chapters
                    </span>
                    {plan.savings && (
                      <span className="ml-2 text-xs text-primary font-medium">
                        {plan.savings}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {plan.recommended && (
                    <span className="text-[10px] font-medium text-coin-gold bg-coin-gold/10 px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                  <span className="font-semibold text-foreground">
                    ${plan.price}
                  </span>
                  {isBuyingCoins === plan.id ? (
                    <Spinner className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Not authenticated */}
      {!isAuthenticated && (
        <Button
          onClick={() =>
            router.push(`${login}?redirect=${encodeURIComponent(window.location.pathname)}`)
          }
          className="w-full h-12"
        >
          Sign in to Unlock
        </Button>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-center">
              Unlock Chapter
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background border-border">
        <DrawerHeader>
          <DrawerTitle className="text-center">Unlock Chapter</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6">{content}</div>
        <div className="p-4 pt-0">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
