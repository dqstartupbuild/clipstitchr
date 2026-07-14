import type { PublicToolInteractionType } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolInteractionType";
import { ToolLeadRequestError } from "@/lib/clipstitchr/tools/toolLeads/server/ToolLeadRequestError";
import { readToolLeadBodyText } from "@/lib/clipstitchr/tools/toolLeads/server/readToolLeadBodyText";

const publicToolInteractionTypes = new Set<PublicToolInteractionType>([
  "resultViewed",
  "resourceUnlocked",
  "paidCtaClicked",
]);

export async function readPublicToolInteractionRequest(request: Request) {
  if (request.headers.get("content-type")?.split(";", 1)[0] !== "application/json") {
    throw new ToolLeadRequestError(415);
  }

  let value: unknown;

  try {
    value = JSON.parse(await readToolLeadBodyText(request));
  } catch (error) {
    if (error instanceof ToolLeadRequestError) throw error;
    throw new ToolLeadRequestError(400);
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ToolLeadRequestError(400);
  }

  const record = value as Record<string, unknown>;

  if (
    Object.keys(record).length !== 1 ||
    typeof record.interactionType !== "string" ||
    !publicToolInteractionTypes.has(
      record.interactionType as PublicToolInteractionType,
    )
  ) {
    throw new ToolLeadRequestError(400);
  }

  return record.interactionType as PublicToolInteractionType;
}
