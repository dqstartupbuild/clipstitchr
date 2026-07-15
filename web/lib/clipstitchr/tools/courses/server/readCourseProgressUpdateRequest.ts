import { courseProgressNoteMaxLength } from "@/lib/clipstitchr/tools/courses/courseProgressNoteMaxLength";
import { ToolLeadRequestError } from "@/lib/clipstitchr/tools/toolLeads/server/ToolLeadRequestError";
import { readToolLeadBodyText } from "@/lib/clipstitchr/tools/toolLeads/server/readToolLeadBodyText";

export async function readCourseProgressUpdateRequest(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw new ToolLeadRequestError(415);
  }

  let input: unknown;

  try {
    input = JSON.parse(await readToolLeadBodyText(request));
  } catch (error) {
    if (error instanceof ToolLeadRequestError) throw error;
    throw new ToolLeadRequestError(400);
  }

  if (!input || typeof input !== "object") {
    throw new ToolLeadRequestError(400);
  }

  const { completed, itemId, note } = input as Record<string, unknown>;

  if (
    typeof completed !== "boolean" ||
    typeof itemId !== "string" ||
    itemId.length < 1 ||
    itemId.length > 100 ||
    typeof note !== "string" ||
    note.length > courseProgressNoteMaxLength
  ) {
    throw new ToolLeadRequestError(400);
  }

  return { completed, itemId, note };
}
