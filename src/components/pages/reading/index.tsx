"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import tabsTriggers from "./tabs/trigger";

const VALID_TAB_VALUES = new Set(tabsTriggers.map((t) => t.value));
const DEFAULT_TAB = tabsTriggers[0].value;

export default function ReadingNovelsComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const currentTab = useMemo(
    () => (tabFromUrl && VALID_TAB_VALUES.has(tabFromUrl) ? tabFromUrl : DEFAULT_TAB),
    [tabFromUrl],
  );

  const setTab = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <main>
      {/* Header */}
      <div className="bg-linear-to-b from-secondary/20 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Novels</h1>
          <p className="text-muted-foreground">
            Manage your reading, bookmarks, and collection
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full">
          <Tabs
            value={currentTab}
            onValueChange={setTab}
            className="gap-4 w-full"
          >
            <TabsList className="h-full bg-card w-full max-w-4xl overflow-auto">
              {tabsTriggers.map(({ icon: Icon, name, value }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex flex-row items-center px-1 sm:px-3 data-[state=active]:bg-primary gap-1 sm:gap-2 max-sm:text-xs"
                >
                  <Icon className="max-sm:size-4" />
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabsTriggers.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <div className="text-muted-foreground text-sm">
                  {tab.content}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </main>
  );
}
