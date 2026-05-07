import type { ReactNode } from "react";
import { DashboardSidebar } from "@/app/_components/dashboard/DashboardSidebar";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <DashboardSidebar />
      <main className="min-w-0 px-4 py-5 md:px-8">{children}</main>
    </div>
  );
}
