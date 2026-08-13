import type { StudioEditorProjectRevisionRecord } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectRevisionRecord";

export function formatStudioEditorRevisionOperation(
  operation: StudioEditorProjectRevisionRecord["operation"],
) {
  if (operation === "create") return "Started";
  if (operation === "archive") return "Archived";
  if (operation === "reopen") return "Reopened";
  return "Autosaved";
}
