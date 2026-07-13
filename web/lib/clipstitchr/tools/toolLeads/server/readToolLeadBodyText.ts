import { ToolLeadRequestError } from "@/lib/clipstitchr/tools/toolLeads/server/ToolLeadRequestError";
import { toolLeadMaxBodyBytes } from "@/lib/clipstitchr/tools/toolLeads/server/toolLeadMaxBodyBytes";

export async function readToolLeadBodyText(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > toolLeadMaxBodyBytes
  ) {
    throw new ToolLeadRequestError(413);
  }

  if (!request.body) {
    throw new ToolLeadRequestError(400);
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bodyByteLength = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    bodyByteLength += value.byteLength;

    if (bodyByteLength > toolLeadMaxBodyBytes) {
      await reader.cancel();
      throw new ToolLeadRequestError(413);
    }

    chunks.push(value);
  }

  const bodyBytes = new Uint8Array(bodyByteLength);
  let offset = 0;

  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(bodyBytes);
}
