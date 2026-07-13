import { AppAdHookRewriterPage } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterPage";
import { appAdHookRewriterDescription } from "@/lib/clipstitchr/tools/appAdHookRewriter/appAdHookRewriterDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  canonical: "/tools/app-ad-hook-rewriter",
  description: appAdHookRewriterDescription,
  keywords: [...publicToolCatalog["app-ad-hook-rewriter"].keywords],
  title: `App Ad Hook Rewrite Tool | ${site.name}`,
});

export default function AppAdHookRewriterRoutePage() {
  return <AppAdHookRewriterPage />;
}
