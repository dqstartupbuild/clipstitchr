import { publicToolGateCatalog } from "../../lib/clipstitchr/tools/catalog/publicToolGateCatalog";
import type { Doc } from "../_generated/dataModel";

export function getToolLeadGateModeIsValid(
  source: Doc<"toolLeadCaptures">["source"],
  gateMode: Doc<"toolLeadCaptures">["gateMode"],
) {
  return publicToolGateCatalog[source].mode === gateMode;
}
