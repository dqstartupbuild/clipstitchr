import type { ToolLeadSource } from "@/lib/clipstitchr/types/ToolLeadSource";
import type { ToolLeadAcceptedResponse } from "@/lib/clipstitchr/tools/toolLeads/ToolLeadAcceptedResponse";
import type { ToolLeadInput } from "@/lib/clipstitchr/tools/toolLeads/ToolLeadInput";

export async function submitToolLead({
  email,
  name,
  source,
}: ToolLeadInput & {
  source: ToolLeadSource;
}): Promise<ToolLeadAcceptedResponse> {
  const endpoint = `/api/tools/${source}/lead`;
  const response = await fetch(endpoint, {
    body: JSON.stringify({ email, name }),
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });
  const body = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (
    !response.ok ||
    body?.accepted !== true ||
    Object.keys(body).length !== 1
  ) {
    throw new Error("Unable to join the mailing list.");
  }

  return { accepted: true };
}
