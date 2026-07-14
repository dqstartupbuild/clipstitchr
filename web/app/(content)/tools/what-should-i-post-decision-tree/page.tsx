import { WhatShouldIPostPage } from "@/app/_components/tools/what-should-i-post/WhatShouldIPostPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["what-should-i-post-decision-tree"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default async function WhatShouldIPostRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(tool.key, false);

  return <WhatShouldIPostPage variant={variant} />;
}
