import type { ReactNode } from "react";
import { ActiveWorkerJobsBanner } from "@/app/_components/dashboard/ActiveWorkerJobsBanner";
import { DashboardSidebar } from "@/app/_components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/app/_components/dashboard/DashboardTopBar";

type DashboardShellProps = {
  children: ReactNode;
  variant?: "page" | "workspace";
};

export function DashboardShell({
  children,
  variant = "page",
}: DashboardShellProps) {
  const shellClassName =
    variant === "workspace"
      ? "flex h-dvh flex-col overflow-hidden bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]"
      : "min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]";
  const mainClassName =
    variant === "workspace"
      ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 py-3 md:px-8 lg:py-5"
      : "min-w-0 px-4 py-5 md:px-8";

  return (
    <div className={shellClassName}>
      <DashboardSidebar />
      <main className={mainClassName}>
        <DashboardTopBar />
        <ActiveWorkerJobsBanner />
        {children}
      </main>
    </div>
  );
}
