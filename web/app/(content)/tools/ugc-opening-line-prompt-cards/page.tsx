import { CollectionResourcePage } from "@/app/_components/tools/resources/CollectionResourcePage";
import { ugcOpeningLinePromptsDefinition } from "@/lib/clipstitchr/tools/ugcOpeningLinePrompts/ugcOpeningLinePromptsDefinition";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["ugc-opening-line-prompt-cards"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default function UgcOpeningLinePromptCardsRoutePage() {
  return (
    <CollectionResourcePage definition={ugcOpeningLinePromptsDefinition} />
  );
}
