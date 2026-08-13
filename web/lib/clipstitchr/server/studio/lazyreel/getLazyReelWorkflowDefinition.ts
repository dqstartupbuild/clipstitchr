import type { LazyReelWorkflowKey } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowKey";
import { listLazyReelWorkflowDefinitions } from "./listLazyReelWorkflowDefinitions";

export function getLazyReelWorkflowDefinition(workflow: LazyReelWorkflowKey) {
  const definition = listLazyReelWorkflowDefinitions().find((item) => item.key === workflow);
  if (!definition) {
    throw new TypeError(`Unsupported LazyReel workflow: ${workflow}`);
  }
  return definition;
}
