import type { Metadata } from "next";
import { SettingsPageClient } from "@/app/dashboard/settings/SettingsPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { getSocialPublishingProvider } from "@/lib/clipstitchr/social/getSocialPublishingProvider";

export const metadata: Metadata = createPageMetadata({
  title: `Settings | ${site.name}`,
  description:
    "Manage ClipStitchr product details, daily draft settings, support options, and subscription controls.",
  canonical: "/dashboard/settings",
  noIndex: true,
});

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    platform?: string | string[];
    reason?: string | string[];
    social?: string | string[];
  }>;
}) {
  const params = searchParams ? await searchParams : {};

  return (
    <SettingsPageClient
      socialConnectionPlatform={
        typeof params.platform === "string" ? params.platform : undefined
      }
      socialConnectionReason={
        typeof params.reason === "string" ? params.reason : undefined
      }
      socialConnectionStatus={
        typeof params.social === "string" ? params.social : undefined
      }
      socialPublishingProvider={getSocialPublishingProvider()}
    />
  );
}
