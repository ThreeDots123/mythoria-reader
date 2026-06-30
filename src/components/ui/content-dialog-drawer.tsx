"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { HtmlProse } from "@/components/ui/html-prose";
import { cn } from "@/lib/utils";

export interface ContentDialogDrawerProps {
  /** Button / trigger label */
  triggerLabel: string;
  /** Title shown in dialog/drawer header */
  title: string;
  /** HTML content to render inside (uses HtmlProse styling) */
  contentHtml: string;
  /** Optional icon component to show before trigger label */
  triggerIcon?: React.ReactNode;
  /** Optional class for the trigger button */
  triggerClassName?: string;
  /** Optional class for the wrapper div (e.g. "mb-0" for inline/compact use) */
  wrapperClassName?: string;
  /** Optional boolean to make the dialog/drawer responsive */
  responsive?: boolean;
}

/**
 * Shows a trigger that opens content in a Dialog on desktop (≥768px) and Drawer on mobile.
 * Use for prologue, long descriptions, or any expandable HTML content.
 */
export function ContentDialogDrawer({
  triggerLabel,
  title,
  contentHtml,
  triggerIcon,
  triggerClassName,
  wrapperClassName,
  responsive,
}: ContentDialogDrawerProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const trigger = (
    <Button
      variant="outline"
      className={
        triggerClassName ??
        "w-full justify-start gap-3 border-primary/30 bg-primary/5 py-6 text-left hover:bg-primary/10 sm:py-7 hover:text-white"
      }
    >
      {triggerIcon}
      <span className={cn("font-medium", responsive && "hidden sm:block")}>
        {triggerLabel}
      </span>
    </Button>
  );

  const wrapperClass = wrapperClassName ?? "mb-12";

  if (isDesktop) {
    return (
      <div className={wrapperClass}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto bg-card border-border text-white">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="pr-6">
              <HtmlProse html={contentHtml} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[90vh] bg-card border-border">
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-8 text-white">
            <HtmlProse html={contentHtml} />
          </div>
          <div className="p-4">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full bg-card">
                Close
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
