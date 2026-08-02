import { redirect } from "next/navigation";
import { createLegacyPublishingRedirect } from "@/lib/clipstitchr/publishing/navigation/createLegacyPublishingRedirect";

export default async function AnalyticsPage({
  searchParams = Promise.resolve({}),
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(createLegacyPublishingRedirect("analytics", await searchParams));
}
