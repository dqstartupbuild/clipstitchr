import type { ReactNode } from "react";
import { Suspense } from "react";
import { DashboardLayoutFallback } from "@/app/_components/dashboard/DashboardLayoutFallback";
import { DashboardLibraryProvider } from "@/app/dashboard/DashboardLibraryProvider";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={<DashboardLayoutFallback />}>
      <DashboardLibraryProvider>{children}</DashboardLibraryProvider>
    </Suspense>
  );
}
