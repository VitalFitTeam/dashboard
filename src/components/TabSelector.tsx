"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabSelectorProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function TabSelector({
  tabs,
  defaultValue,
  className,
  onValueChange,
}: TabSelectorProps) {
  const initial = defaultValue ?? tabs[0]?.value ?? "";

  return (
    <Tabs
      defaultValue={initial}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList className="w-full justify-start">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
