"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import Logo from "@/assets/logo";
import { home, login } from "@/routes/client";
import { Field } from "@/components/ui/field";
import { forgotPasswordAction } from "@/server-actions/auth";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPasswordAccount() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await forgotPasswordAction(email);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(
          result.error || "Failed to send reset link. Please try again."
        );
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      console.error("Forgot password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6 mx-auto">
      <Link href={home} className="block h-fit mb-12 sm:mb-16 lg:mb-24">
        <Button variant="ghost" className="group text-muted-foreground">
          <ChevronLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to the website
        </Button>
      </Link>

      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-center">
          <Logo className="size-15" />
          <span className="text-3xl font-semibold font-heading">Mythoria</span>
        </div>

        {/* Title and Description */}
        <div>
          <h2 className="mb-1.5 text-2xl font-semibold">Forgot Password</h2>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
            If an account with that email exists, a password reset link has been
            sent. Please check your email. This may take a few minutes to arrive.
            If you don't receive an email, please check your spam folder or contact support.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {!success ? (
          <>
            {/* Forgot Password Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                className="h-10 bg-card border-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Sending reset link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <Field className="text-center">
              <Link
                href={login}
                className="text-foreground hover:underline hover:text-accent"
              >
                Back to login
              </Link>
            </Field>
          </>
        ) : (
          <Field className="text-center">
            <Link
              href={login}
              className="text-foreground hover:underline hover:text-accent"
            >
              Back to login
            </Link>
          </Field>
        )}
      </div>
    </div>
  );
}
