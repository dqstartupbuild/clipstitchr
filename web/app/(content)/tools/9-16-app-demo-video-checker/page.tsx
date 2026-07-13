import { NineBySixteenVideoCheckerPage } from "@/app/_components/tools/9-16-app-demo-video-checker/NineBySixteenVideoCheckerPage";
import { nineBySixteenVideoCheckerDescription } from "@/lib/clipstitchr/tools/nineBySixteenVideoChecker/nineBySixteenVideoCheckerDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `9:16 App Demo Video Checker | ${site.name}`,
  description: nineBySixteenVideoCheckerDescription,
  canonical: "/tools/9-16-app-demo-video-checker",
  keywords: publicToolCatalog["9-16-app-demo-video-checker"].keywords,
});

export default function NineBySixteenVideoCheckerRoutePage() {
  return <NineBySixteenVideoCheckerPage />;
}
