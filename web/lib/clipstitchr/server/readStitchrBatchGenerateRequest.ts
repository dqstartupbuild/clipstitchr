type StitchrBatchGenerateRequest = {
  templateId?: string;
};

export async function readStitchrBatchGenerateRequest(
  request: Request,
): Promise<StitchrBatchGenerateRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return {};
  }

  const body = (await request.json().catch(() => null)) as unknown;

  if (!body || typeof body !== "object") {
    return {};
  }

  const { templateId } = body as { templateId?: unknown };
  const normalizedTemplateId =
    typeof templateId === "string" ? templateId.trim() : "";

  return normalizedTemplateId ? { templateId: normalizedTemplateId } : {};
}
