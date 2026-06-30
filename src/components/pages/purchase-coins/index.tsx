"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createCoinPurchaseOrderAction } from "@/server-actions/payment";
import { toast } from "sonner";
import { PiCoinsThin } from "react-icons/pi";
import { Spinner } from "@/components/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import {
  Lock,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COINS_PER_CHAPTER = 15;

const coinPlans = [
  {
    id: 1,
    amount: 100,
    price: 5,
    label: "Starter",
    bonus: null,
  },
  {
    id: 2,
    amount: 200,
    price: 10,
    label: "Popular",
    recommended: true,
    bonus: null,
  },
  {
    id: 3,
    amount: 500,
    price: 25,
    label: "Value",
    bonus: "Save 17%",
  },
  {
    id: 4,
    amount: 1000,
    price: 50,
    label: "Power",
    bonus: "Save 17%",
  },
];

const perks = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Coins hit your balance the moment payment clears.",
  },
  {
    icon: Lock,
    title: "Yours Forever",
    description: "Unlocked chapters stay accessible anytime, no expiry.",
  },
  {
    icon: RefreshCw,
    title: "Chapters Go Free",
    description: "Premium chapters unlock for everyone after ~14 days.",
  },
];

const faqs = [
  {
    question: "How long does it take to get my coins?",
    answer:
      "Instantly! Your coins are credited as soon as payment is confirmed.",
  },
  {
    question: "What happens to purchased chapters?",
    answer:
      "Once you unlock a chapter with coins, it's yours forever — you can re-read it anytime.",
  },
  {
    question: "Do chapters ever become free?",
    answer:
      "Yes! Premium chapters become free after about 14 days. But if you can't wait, coins let you read them immediately.",
  },
  {
    question: "How many coins does a chapter cost?",
    answer:
      "Most chapters cost 20 coins, though some special chapters may vary. The cost is always shown before you unlock.",
  },
  {
    question: "I had a problem with my purchase — where can I get help?",
    answer:
      "Join our Discord community! Our support team is there to help with any issues.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-card/60 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{question}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 ml-3" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-3" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/20 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}

type Plan = (typeof coinPlans)[number];

export default function PurchaseCoinsComponent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingMethod, setLoadingMethod] = useState<
    "paypal" | "crypto" | null
  >(null);

  const balance = user?.coinBalance ?? 0;
  const chaptersWorth = Math.floor(balance / COINS_PER_CHAPTER);

  const openSheet = (plan: Plan) => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase coins");
      router.push(`/account/login?redirect=${encodeURIComponent("/purchase")}`);
      return;
    }
    setSelectedPlan(plan);
  };

  const closeSheet = () => {
    if (loadingMethod) return;
    setSelectedPlan(null);
  };

  const handlePayPal = async () => {
    if (!selectedPlan) return;
    setLoadingMethod("paypal");
    try {
      const result = await createCoinPurchaseOrderAction({
        coinAmount: selectedPlan.amount,
        amountPaid: selectedPlan.price,
      });
      if (!result.success) {
        toast.error(result.error || "Failed to create payment order");
        return;
      }
      if (result.data?.approvalUrl) {
        window.location.href =
          result.data.approvalUrl + `?orderId=${result.data.orderId}`;
      } else {
        toast.error("Failed to get payment URL");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoadingMethod(null);
    }
  };

  const handleCrypto = async () => {
    // TODO: implement when endpoint is ready
    toast.info("Crypto payments coming soon");
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/20">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent" />

        <div className="relative max-w-4xl mx-auto px-6 pt-14 pb-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Coin Store
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Read More,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
              Wait Less
            </span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
            Unlock premium chapters instantly with coins. No subscription, pay
            only for what you read.
          </p>

          {/* Balance pill */}
          {isAuthenticated && (
            <div className="inline-flex items-center gap-3 mt-8 px-5 py-3 rounded-full bg-card border border-coin-gold/25">
              <div className="flex items-center gap-1.5 text-coin-gold">
                <PiCoinsThin className="w-5 h-5" />
                <span className="text-lg font-bold">{balance}</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <span className="text-sm text-muted-foreground">
                {chaptersWorth > 0
                  ? `~${chaptersWorth} chapters available`
                  : "0 chapters — top up below"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Plans */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coinPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => openSheet(plan)}
                className={cn(
                  "group relative flex flex-col p-6 rounded-2xl border text-left transition-all duration-200 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-primary/50",
                  plan.recommended
                    ? "border-coin-gold/40 bg-linear-to-br from-coin-gold/10 to-card hover:border-coin-gold/60 hover:shadow-xl hover:shadow-coin-gold/10"
                    : "border-border/30 bg-card hover:border-border/60 hover:shadow-lg hover:shadow-black/10"
                )}
              >
                {/* Top row: badges */}
                <div className="flex items-center gap-2 mb-5">
                  {plan.recommended ? (
                    <span className="text-[10px] font-bold text-black bg-coin-gold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      Most Popular
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted/20 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      {plan.label}
                    </span>
                  )}
                  {plan.bonus && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      {plan.bonus}
                    </span>
                  )}
                </div>

                {/* Coin amount */}
                <div className="flex items-center gap-2 mb-1">
                  <PiCoinsThin
                    className={cn(
                      "w-8 h-8",
                      plan.recommended ? "text-coin-gold" : "text-coin-gold/70"
                    )}
                  />
                  <span className="text-4xl font-bold text-foreground tracking-tight">
                    {plan.amount.toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-6">
                  Unlock up to{" "}
                  <span className="text-foreground font-medium">
                    {Math.floor(plan.amount / COINS_PER_CHAPTER)} chapters
                  </span>
                </p>

                {/* Price + CTA */}
                <div
                  className={cn(
                    "mt-auto flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-colors",
                    plan.recommended
                      ? "bg-coin-gold text-black group-hover:bg-coin-gold-hover"
                      : "bg-muted/20 text-foreground group-hover:bg-muted/30"
                  )}
                >
                  <span className="text-base font-bold">${plan.price}</span>
                  <span>Buy now →</span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Payments secured by PayPal · All prices in USD
          </p>
        </div>

        {/* Perks */}
        <div>
          <h2 className="text-lg font-semibold text-foreground text-center mb-6">
            Why use coins?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {perks.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/50 border border-border/20"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl border border-border/20 bg-card/30 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            How it works
          </h2>
          <div className="space-y-4">
            {[
              {
                step: "1",
                text: "Pick a coin pack and complete payment via PayPal",
              },
              { step: "2", text: "Coins appear in your balance instantly" },
              {
                step: "3",
                text: "Tap any locked chapter and spend coins to unlock it",
              },
              {
                step: "4",
                text: "Re-read unlocked chapters anytime, no time limit",
              },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{step}</span>
                </div>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-foreground">
              Common questions
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-2">
            {faqs.map((faq, idx) => (
              <FaqItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* Footer trust note */}
        <div className="text-center pb-4">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Payments processed securely via PayPal
          </div>
        </div>
      </div>
      {/* Payment method sheet */}
      <AnimatePresence>
        {selectedPlan && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={closeSheet}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: { type: "spring", damping: 28, stiffness: 300 },
              }}
              exit={{
                y: "100%",
                opacity: 0,
                transition: { duration: 0.22, ease: [0.32, 0, 0.67, 0] },
              }}
              className="fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full"
            >
              <div className="bg-card rounded-t-2xl md:rounded-2xl border border-border/30 shadow-2xl overflow-hidden">
                {/* Handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 md:hidden">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-4 pb-5">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Choose payment method
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <PiCoinsThin className="w-4 h-4 text-coin-gold" />
                      <span className="text-sm font-semibold text-coin-gold">
                        {selectedPlan.amount.toLocaleString()} coins
                      </span>
                      <span className="text-muted-foreground/40 text-sm">
                        ·
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ${selectedPlan.price}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeSheet}
                    disabled={!!loadingMethod}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors disabled:opacity-40"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Methods */}
                <div className="px-6 pb-6 space-y-3">
                  {/* PayPal */}
                  <button
                    onClick={handlePayPal}
                    disabled={!!loadingMethod}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                      "border-border/30 bg-card hover:border-primary/40 hover:bg-primary/5",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#003087]/10 border border-[#003087]/20 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                        <path
                          d="M19.5 8.5c.3-2-1.2-3.5-3.8-3.5H9.3c-.3 0-.5.2-.6.5L6.2 17c0 .2.1.4.4.4h2.9l.7-4.6v.2c.1-.3.3-.5.6-.5h1.3c2.5 0 4.4-1 5-4 .2-1.1.1-1.9-.4-2.5z"
                          fill="#009CDE"
                        />
                        <path
                          d="M19.9 11c-.6 3-2.5 4-5 4h-1.3c-.3 0-.5.2-.6.5L12 20h-2.5l-.4 2.4c0 .2.1.3.3.3h2.4c.3 0 .5-.2.5-.4l.6-4h1.3c2.5 0 4.4-1 5-4 .2-1.1.1-2.1-.3-2.3z"
                          fill="#012169"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        PayPal
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pay securely with your PayPal account
                      </p>
                    </div>
                    {loadingMethod === "paypal" ? (
                      <Spinner className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Cryptomus */}
                  <button
                    onClick={handleCrypto}
                    disabled={!!loadingMethod}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                      "border-border/30 bg-card hover:border-primary/40 hover:bg-primary/5",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <svg
                        viewBox="0 0 32 36"
                        className="w-4.5 h-4.5 text-emerald-400"
                        fill="currentColor"
                      >
                        <path d="M30.611 8.507 16.935.61a2.01 2.01 0 0 0-2.005 0L1.254 8.507A2.01 2.01 0 0 0 .25 10.245v15.791c0 .713.384 1.378 1.004 1.738L14.93 35.67a2.034 2.034 0 0 0 2.008 0l13.677-7.896a2.01 2.01 0 0 0 1.004-1.738V10.245c0-.713-.385-1.378-1.004-1.738zM16.242 17.16a.62.62 0 0 1-.62 0L2.328 9.487l13.296-7.675a.64.64 0 0 1 .62 0l13.295 7.675zm-1.312 1.197q.146.084.312.142v15.743l-13.296-7.67a.62.62 0 0 1-.311-.537V10.684z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          Cryptomus
                        </p>
                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          Coming soon
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pay with Bitcoin, USDT and more
                      </p>
                    </div>
                    {loadingMethod === "crypto" ? (
                      <Spinner className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
