"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PanelWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function PanelWrapper({
  title,
  description,
  children,
}: PanelWrapperProps) {
  return (
    <Card className="pt-4">
      <CardHeader>
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
