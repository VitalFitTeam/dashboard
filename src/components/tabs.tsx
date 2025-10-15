"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import clsx from "clsx";

interface TabsContextType {
  value: string;
  setValue: (v: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  className,
  children,
}) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={clsx("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

// === TabsList ===
export const TabsList: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={clsx(
      "inline-flex items-center justify-center rounded-md bg-muted p-1 mb-2 border border-gray-200 bg-gray-100",
      className,
    )}
  >
    {children}
  </div>
);

// === TabsTrigger ===
interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
}) => {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const isActive = ctx.value === value;

  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={clsx(
        "px-3 py-1.5 text-sm font-medium rounded-sm transition-all",
        isActive
          ? "bg-white text-gray-900 shadow-sm border border-gray-300"
          : "text-gray-500 hover:text-gray-800",
        className,
      )}
    >
      {children}
    </button>
  );
};

// === TabsContent ===
interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
}) => {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsContent must be used within Tabs");
  }

  if (ctx.value !== value) {
    return null;
  }

  return <div className={clsx("mt-4", className)}>{children}</div>;
};
