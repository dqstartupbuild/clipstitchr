import type { Metadata } from "next";
import { SettingsPageClient } from "@/app/dashboard/settings/SettingsPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Settings | ${site.name}`,
  description:
    "Manage ClipStitchr product profiles, support options, and subscription controls for the dashboard.",
  canonical: "/dashboard/settings",
  noIndex: true,
});

export default function SettingsPage() {
  return <SettingsPageClient />;
}
