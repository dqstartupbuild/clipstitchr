import type { ReactNode } from "react";
import { DashboardLibraryProvider } from "@/app/dashboard/DashboardLibraryProvider";
import { DashboardProductProvider } from "@/app/dashboard/DashboardProductProvider";
import { StudioBetaAccessProvider } from "@/app/dashboard/StudioBetaAccessProvider";
import { AccountContactSync } from "@/app/_components/dashboard/AccountContactSync";
import { DevelopmentDashboardRoute } from "@/app/dashboard/development/DevelopmentDashboardRoute";
import { getDevelopmentAuthBypassRequestStatus } from "@/lib/clipstitchr/development/auth/getDevelopmentAuthBypassRequestStatus";
import { getStudioBetaGlobalEnabled } from "@/lib/clipstitchr/studio/access/getStudioBetaGlobalEnabled";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const mayUseDevelopmentAuthBypass =
    process.env.NODE_ENV === "development" &&
    process.env.DEV_AUTH_BYPASS_ENABLED === "true";
  const isDevelopmentAuthBypass = mayUseDevelopmentAuthBypass
    ? await getDevelopmentAuthBypassRequestStatus()
    : false;

  if (isDevelopmentAuthBypass) {
    return <DevelopmentDashboardRoute />;
  }

  return (
    <DashboardProductProvider>
      <StudioBetaAccessProvider
        isServerEnabled={getStudioBetaGlobalEnabled()}
      >
        <AccountContactSync />
        <DashboardLibraryProvider>{children}</DashboardLibraryProvider>
      </StudioBetaAccessProvider>
    </DashboardProductProvider>
  );
}
