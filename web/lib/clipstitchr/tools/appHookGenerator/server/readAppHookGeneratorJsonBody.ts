import { AppHookGeneratorBodyTooLargeError } from "@/lib/clipstitchr/tools/appHookGenerator/server/AppHookGeneratorBodyTooLargeError";
import { AppHookGeneratorInputError } from "@/lib/clipstitchr/tools/appHookGenerator/server/AppHookGeneratorInputError";
import { appHookGeneratorMaxBodyBytes } from "@/lib/clipstitchr/tools/appHookGenerator/server/appHookGeneratorMaxBodyBytes";

export async function readAppHookGeneratorJsonBody(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > appHookGeneratorMaxBodyBytes) {
    throw new AppHookGeneratorBodyTooLargeError();
  }

  if (!request.body) {
    throw new AppHookGeneratorInputError();
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

    if (bodyByteLength > appHookGeneratorMaxBodyBytes) {
      await reader.cancel();
      throw new AppHookGeneratorBodyTooLargeError();
    }

    chunks.push(value);
  }

  const bodyBytes = new Uint8Array(bodyByteLength);
  let offset = 0;

  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const bodyText = new TextDecoder().decode(bodyBytes);

  try {
    return JSON.parse(bodyText) as unknown;
  } catch {
    throw new AppHookGeneratorInputError();
  }
}
