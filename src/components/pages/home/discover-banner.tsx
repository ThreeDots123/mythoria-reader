import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { register, login } from "@/routes/client";

export default function DiscoverBanner() {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-purple-900/60 via-purple-800/40 to-indigo-900/60 border border-purple-500/20 p-8 md:p-10">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 shrink-0">
                <Sparkles className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Discover Your Next Favorite Series
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  Create an account to get personalized recommendations based on
                  your reading preferences
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href={register}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <Sparkles className="w-4 h-4" />
                  Sign Up Free
                </Button>
              </Link>
              <Link href={login}>
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
