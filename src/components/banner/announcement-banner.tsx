"use client";

import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface AnnouncementBannerProps {
  id?: string;
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

const typeConfig = {
  info: {
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    accentColor: "from-amber-500/20 to-transparent",
    icon: Info,
  },
  success: {
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    accentColor: "from-emerald-500/20 to-transparent",
    icon: CheckCircle,
  },
  warning: {
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    accentColor: "from-orange-500/20 to-transparent",
    icon: AlertTriangle,
  },
  error: {
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    accentColor: "from-red-500/20 to-transparent",
    icon: AlertCircle,
  },
};

export function AnnouncementBanner({
  id = "announcement",
  type = "info",
  title,
  message,
  action,
  dismissible = true,
  onDismiss,
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id={id}
          role="alert"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative overflow-hidden rounded-xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-xl"
        >
          <div className={cn("absolute inset-0 bg-gradient-to-r opacity-40", config.accentColor)} />

          <div className="relative flex items-start gap-3 px-4 py-3.5">
            <div className={cn("flex-shrink-0 rounded-lg p-1.5 mt-0.5", config.iconBg)}>
              <Icon className={cn("h-4 w-4", config.iconColor)} />
            </div>

            <div className="flex-1 min-w-0">
              {title && (
                <p className="font-semibold text-sm text-foreground">{title}</p>
              )}
              <p className={cn("text-sm text-muted-foreground leading-relaxed", title && "mt-0.5")}>
                {message}
              </p>

              {action && (
                <div className="mt-2">
                  {action.href ? (
                    <a
                      href={action.href}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold rounded-md px-3 py-1.5 transition-colors",
                        "bg-primary/15 text-primary hover:bg-primary/25",
                      )}
                    >
                      {action.label}
                      <span>→</span>
                    </a>
                  ) : (
                    <button
                      onClick={action.onClick}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold rounded-md px-3 py-1.5 transition-colors",
                        "bg-primary/15 text-primary hover:bg-primary/25",
                      )}
                    >
                      {action.label}
                      <span>→</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                aria-label="Close announcement"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
