import { notFound } from "next/navigation";
import { SocialPublishingBrowserAcceptanceHarness } from "@/app/_components/browser-tests/SocialPublishingBrowserAcceptanceHarness";

export const dynamic = "force-dynamic";

export default function SocialPublishingBrowserAcceptancePage() {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.SOCIAL_BROWSER_TEST_MODE !== "1"
  ) {
    notFound();
  }

  return <SocialPublishingBrowserAcceptanceHarness />;
}
