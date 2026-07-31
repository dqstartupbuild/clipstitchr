import type { ReactNode } from "react";
import { DashboardLibraryProvider } from "@/app/dashboard/DashboardLibraryProvider";
import { DashboardProductProvider } from "@/app/dashboard/DashboardProductProvider";
import { AccountContactSync } from "@/app/_components/dashboard/AccountContactSync";
import { SocialPublishingProviderProvider } from "@/app/dashboard/SocialPublishingProviderProvider";
import { getSocialPublishingProvider } from "@/lib/clipstitchr/social/getSocialPublishingProvider";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const socialPublishingProvider = getSocialPublishingProvider();

  return (
    <SocialPublishingProviderProvider provider={socialPublishingProvider}>
      <DashboardProductProvider>
        <AccountContactSync />
        <DashboardLibraryProvider>{children}</DashboardLibraryProvider>
      </DashboardProductProvider>
    </SocialPublishingProviderProvider>
  );
}
