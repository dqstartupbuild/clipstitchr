import type { ReactNode } from "react";
import { ActiveWorkerJobsBanner } from "@/app/_components/dashboard/ActiveWorkerJobsBanner";
import { DashboardSidebar } from "@/app/_components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/app/_components/dashboard/DashboardTopBar";

type DashboardShellProps = {
  children: ReactNode;
  contentAs?: "div" | "main";
};

export function DashboardShell({
  children,
  contentAs = "main",
}: DashboardShellProps) {
  const Content = contentAs;

  return (
    <div className="dashboard-shell min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[268px_1fr]">
      <DashboardSidebar />
      <Content className="dashboard-main min-w-0 px-4 py-5 md:px-8 lg:px-10">
        <DashboardTopBar />
        <ActiveWorkerJobsBanner />
        {children}
      </Content>
    </div>
  );
}
