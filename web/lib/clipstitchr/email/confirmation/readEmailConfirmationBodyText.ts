import { EmailConfirmationRequestError } from "@/lib/clipstitchr/email/confirmation/EmailConfirmationRequestError";
import { emailConfirmationMaxBodyBytes } from "@/lib/clipstitchr/email/confirmation/emailConfirmationMaxBodyBytes";

export async function readEmailConfirmationBodyText(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > emailConfirmationMaxBodyBytes
  ) {
    throw new EmailConfirmationRequestError(413);
  }

  if (!request.body) {
    throw new EmailConfirmationRequestError(400);
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

    if (bodyByteLength > emailConfirmationMaxBodyBytes) {
      await reader.cancel();
      throw new EmailConfirmationRequestError(413);
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
