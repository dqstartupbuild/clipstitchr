import { ToolsIndexPage } from "@/app/_components/tools/ToolsIndexPage";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Free App Marketing Tools for Founders | ClipStitchr",
  description:
    "Use fifteen free app marketing tools for hooks, UGC briefs, creative tests, production costs, and app-video checks before making your next short-form ad.",
  canonical: "/tools",
  keywords: [
    "app marketing tools",
    "free app marketing tools",
    "mobile app ad tools",
    "app hook generator",
    "ad variant calculator",
    "app demo video checker",
    "UGC ad brief builder",
    "app creative testing tools",
  ],
});

export default function ToolsPage() {
  return <ToolsIndexPage />;
}
