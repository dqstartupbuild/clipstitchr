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

export default function SettingsPage() {
  return (
    <SettingsPageClient
      socialPublishingProvider={getSocialPublishingProvider()}
    />
  );
}
