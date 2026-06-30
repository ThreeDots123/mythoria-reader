import { WrenchIcon, BookOpen } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Glow backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/8 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center max-w-md">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150" />
          <div className="relative w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <WrenchIcon className="w-9 h-9 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        {/* Wordmark */}
        <div className="flex items-center gap-2 mb-6 text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-widest uppercase">
            Mythoria
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-3 leading-tight">
          We&apos;ll be back soon
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed mb-8">
          Mythoria is currently undergoing scheduled maintenance to bring you an
          even better reading experience. Hang tight — we&apos;ll be up shortly.
        </p>

        {/* Status pill */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Maintenance in progress
        </div>
      </div>
    </div>
  );
}
