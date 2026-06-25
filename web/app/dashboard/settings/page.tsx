import type { Metadata } from "next";
import { SettingsPageClient } from "@/app/dashboard/settings/SettingsPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Settings | ${site.name}`,
  description:
    "Manage ClipStitchr product details, Hook Lab taste, daily draft settings, support options, and subscription controls.",
  canonical: "/dashboard/settings",
  noIndex: true,
});

export default function SettingsPage() {
  return <SettingsPageClient />;
}
