import { publicToolCatalog } from "../../lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { Doc } from "../_generated/dataModel";

export function getMarketingLeadSegmentForTool(
  source: Doc<"toolLeadCaptures">["source"],
) {
  const category = publicToolCatalog[source].category;

  if (category === "hooks") return "hooks-and-messaging" as const;
  if (category === "planning") return "content-planning" as const;
  if (category === "production" || category === "video") {
    return "production-readiness" as const;
  }
  if (category === "learning") return "learning-and-systems" as const;

  return "economics-and-scaling" as const;
}
