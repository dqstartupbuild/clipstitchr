import type { Doc } from "../_generated/dataModel";
import type { StudioEditorProjectWriteResult } from "../../lib/clipstitchr/types/studioEditor/StudioEditorProjectWriteResult";

export function toStudioEditorProjectWriteResult(
  receipt: Pick<
    Doc<"studioEditorProjectWriteReceipts">,
    "projectId" | "resultingRevision" | "resultingStatus"
  >,
  created: boolean,
): StudioEditorProjectWriteResult {
  return {
    created,
    projectId: receipt.projectId,
    revision: receipt.resultingRevision,
    status: receipt.resultingStatus,
  };
}
