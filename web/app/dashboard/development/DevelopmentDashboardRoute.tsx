"use client";

import { usePathname } from "next/navigation";
import { DevelopmentAnalyticsPage } from "@/app/dashboard/development/DevelopmentAnalyticsPage";
import { DevelopmentDashboardHomePage } from "@/app/dashboard/development/DevelopmentDashboardHomePage";
import { DevelopmentHookLabPage } from "@/app/dashboard/development/DevelopmentHookLabPage";
import { DevelopmentLibraryPage } from "@/app/dashboard/development/DevelopmentLibraryPage";
import { DevelopmentSchedulePage } from "@/app/dashboard/development/DevelopmentSchedulePage";
import { DevelopmentSettingsPage } from "@/app/dashboard/development/DevelopmentSettingsPage";
import { DevelopmentStudioUnavailablePage } from "@/app/dashboard/development/DevelopmentStudioUnavailablePage";
import { DevelopmentToolPage } from "@/app/dashboard/development/DevelopmentToolPage";

export function DevelopmentDashboardRoute() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard/studio")) {
    return <DevelopmentStudioUnavailablePage />;
  }

  if (
    pathname.startsWith("/dashboard/library") ||
    pathname.startsWith("/dashboard/uploads") ||
    pathname.startsWith("/dashboard/avatars") ||
    pathname.startsWith("/dashboard/stitches")
  ) {
    return <DevelopmentLibraryPage />;
  }

  if (pathname.startsWith("/dashboard/hooks")) {
    return <DevelopmentHookLabPage />;
  }

  if (pathname.startsWith("/dashboard/schedule")) {
    return <DevelopmentSchedulePage />;
  }

  if (pathname.startsWith("/dashboard/analytics")) {
    return <DevelopmentAnalyticsPage />;
  }

  if (pathname.startsWith("/dashboard/settings")) {
    return <DevelopmentSettingsPage />;
  }

  if (pathname.startsWith("/dashboard/stitchr")) {
    return <DevelopmentToolPage tool="stitchr" />;
  }

  if (pathname.startsWith("/dashboard/clipr")) {
    return <DevelopmentToolPage tool="clipr" />;
  }

  if (pathname.startsWith("/dashboard/swipr")) {
    return <DevelopmentToolPage tool="swipr" />;
  }

  if (pathname.startsWith("/dashboard/swapr")) {
    return <DevelopmentToolPage tool="swapr" />;
  }

  if (pathname.startsWith("/dashboard/onboarding")) {
    return <DevelopmentToolPage tool="onboarding" />;
  }

  return <DevelopmentDashboardHomePage />;
}
