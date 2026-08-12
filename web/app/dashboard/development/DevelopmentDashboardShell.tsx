import type { ReactNode } from "react";
import { DevelopmentDashboardSidebar } from "@/app/dashboard/development/DevelopmentDashboardSidebar";
import { DevelopmentPreviewIndicator } from "@/app/dashboard/development/DevelopmentPreviewIndicator";

type DevelopmentDashboardShellProps = {
  children: ReactNode;
};

export function DevelopmentDashboardShell({
  children,
}: DevelopmentDashboardShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[248px_1fr]">
      <DevelopmentDashboardSidebar />
      <main className="min-w-0 px-4 py-5 md:px-8 lg:px-10">
        <DevelopmentPreviewIndicator />
        {children}
      </main>
    </div>
  );
}
