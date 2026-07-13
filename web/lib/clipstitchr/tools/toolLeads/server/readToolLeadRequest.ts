import type { ToolLeadInput } from "@/lib/clipstitchr/tools/toolLeads/ToolLeadInput";
import { getToolLeadInputIsValid } from "@/lib/clipstitchr/tools/toolLeads/getToolLeadInputIsValid";
import { normalizeToolLeadEmail } from "@/lib/clipstitchr/tools/toolLeads/normalizeToolLeadEmail";
import { normalizeToolLeadName } from "@/lib/clipstitchr/tools/toolLeads/normalizeToolLeadName";
import { ToolLeadRequestError } from "@/lib/clipstitchr/tools/toolLeads/server/ToolLeadRequestError";
import { readToolLeadBodyText } from "@/lib/clipstitchr/tools/toolLeads/server/readToolLeadBodyText";

export async function readToolLeadRequest(
  request: Request,
): Promise<ToolLeadInput> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.split(";", 1)[0]?.trim() !== "application/json") {
    throw new ToolLeadRequestError(415);
  }

  const bodyText = await readToolLeadBodyText(request);

  let body: unknown;

  try {
    body = JSON.parse(bodyText);
  } catch {
    throw new ToolLeadRequestError(400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ToolLeadRequestError(400);
  }

  const record = body as Record<string, unknown>;
  const keys = Object.keys(record);

  if (
    keys.length !== 2 ||
    !keys.every((key) => key === "email" || key === "name") ||
    typeof record.email !== "string" ||
    typeof record.name !== "string"
  ) {
    throw new ToolLeadRequestError(400);
  }

  const input = {
    email: normalizeToolLeadEmail(record.email),
    name: normalizeToolLeadName(record.name),
  };

  if (!getToolLeadInputIsValid(input)) {
    throw new ToolLeadRequestError(400);
  }

  return input;
}
