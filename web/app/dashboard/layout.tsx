import type { ReactNode } from "react";
import { AuthenticatedAppProviders } from "@/app/_components/auth/AuthenticatedAppProviders";
import { DashboardLibraryProvider } from "@/app/dashboard/DashboardLibraryProvider";
import { DashboardProductProvider } from "@/app/dashboard/DashboardProductProvider";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthenticatedAppProviders>
      <DashboardProductProvider>
        <DashboardLibraryProvider>{children}</DashboardLibraryProvider>
      </DashboardProductProvider>
    </AuthenticatedAppProviders>
  );
}
