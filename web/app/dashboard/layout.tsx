import type { ReactNode } from "react";
import { DashboardLibraryProvider } from "@/app/dashboard/DashboardLibraryProvider";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardLibraryProvider>{children}</DashboardLibraryProvider>;
}
