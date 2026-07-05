import type { ReactNode } from "react";
import { ActiveWorkerJobsBanner } from "@/app/_components/dashboard/ActiveWorkerJobsBanner";
import { DashboardSidebar } from "@/app/_components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/app/_components/dashboard/DashboardTopBar";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <DashboardSidebar />
      <main className="min-w-0 px-4 py-5 md:px-8">
        <DashboardTopBar />
        <ActiveWorkerJobsBanner />
        {children}
      </main>
    </div>
  );
}
