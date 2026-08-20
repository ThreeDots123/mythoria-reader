"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPaymentAction } from "@/server-actions/payment";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export default function PurchaseSuccessComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const verifiedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get("token");

    if (!orderId) {
      toast.error("Invalid payment return");
      router.push("/purchase");
      return;
    }

    // PayPal allows a single capture per order, so a re-run of this effect must
    // never fire a second verification for the same token.
    if (verifiedTokenRef.current === orderId) return;
    verifiedTokenRef.current = orderId;

    const verifyPayment = async () => {
      try {
        const result = await verifyPaymentAction(orderId);

        if (!result.success) {
          toast.error(result.error || "Payment verification failed", {
            style: {
              "--normal-bg":
                "color-mix(in oklab, var(--destructive) 10%, var(--background))",
              "--normal-text": "var(--destructive)",
              "--normal-border": "var(--destructive)",
            } as React.CSSProperties,
          });
          router.push("/purchase");
          return;
        }

        if (result.data?.success) {
          setVerified(true);

          toast.success(
            `Payment successful! You received ${result.data.coinPurchase.coinAmount.toLocaleString()} coins.`,
            {
              style: {
                "--normal-bg":
                  "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
                "--normal-text":
                  "light-dark(var(--color-green-600), var(--color-green-400))",
                "--normal-border":
                  "light-dark(var(--color-green-600), var(--color-green-400))",
              } as React.CSSProperties,
            }
          );

          // Refresh user data to update coin balance
          await refreshUser();

          // Redirect to purchase page after 3 seconds
          setTimeout(() => {
            router.push("/purchase");
          }, 3000);
        } else {
          toast.error("Payment verification failed", {
            style: {
              "--normal-bg":
                "color-mix(in oklab, var(--destructive) 10%, var(--background))",
              "--normal-text": "var(--destructive)",
              "--normal-border": "var(--destructive)",
            } as React.CSSProperties,
          });
          router.push("/purchase");
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred", {
          style: {
            "--normal-bg":
              "color-mix(in oklab, var(--destructive) 10%, var(--background))",
            "--normal-text": "var(--destructive)",
            "--normal-border": "var(--destructive)",
          } as React.CSSProperties,
        });
        router.push("/purchase");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, router, refreshUser]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-900 via-pink-800 to-purple-950">
      <div className="text-center text-white p-8">
        {verifying ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
            <p className="text-white/80">
              Please wait while we verify your payment.
            </p>
          </>
        ) : verified ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-white/80">
              Your coins have been added to your account.
            </p>
            <p className="text-white/60 mt-2">Redirecting you back...</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2">
              Payment Verification Failed
            </h1>
            <p className="text-white/80">
              Please contact support if you were charged.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
