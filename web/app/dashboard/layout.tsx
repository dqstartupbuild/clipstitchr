import type { ReactNode } from "react";
import { DashboardLibraryProvider } from "@/app/dashboard/DashboardLibraryProvider";
import { DashboardProductProvider } from "@/app/dashboard/DashboardProductProvider";
import { AccountContactSync } from "@/app/_components/dashboard/AccountContactSync";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardProductProvider>
      <AccountContactSync />
      <DashboardLibraryProvider>{children}</DashboardLibraryProvider>
    </DashboardProductProvider>
  );
}
