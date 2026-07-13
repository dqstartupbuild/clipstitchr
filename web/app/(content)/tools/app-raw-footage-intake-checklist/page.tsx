import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { appRawFootageIntakeDefinition } from "@/lib/clipstitchr/tools/appRawFootageIntake/appRawFootageIntakeDefinition";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["app-raw-footage-intake-checklist"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default function AppRawFootageIntakeRoutePage() {
  return <GuidedResourcePage definition={appRawFootageIntakeDefinition} />;
}
