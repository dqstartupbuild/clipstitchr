import { HookVisualMatchmakerPage } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerPage";
import { hookVisualMatchmakerDescription } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/hookVisualMatchmakerDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  canonical: "/tools/hook-to-visual-matchmaker",
  description: hookVisualMatchmakerDescription,
  keywords: [...publicToolCatalog["hook-to-visual-matchmaker"].keywords],
  title: `Hook-to-Visual Matchmaker for App Ads | ${site.name}`,
});

export default function HookVisualMatchmakerRoutePage() {
  return <HookVisualMatchmakerPage />;
}
