import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import type { PublishingProvider } from "../../providers/PublishingProvider.js";

export const readBoundedProviderResponseBody = async (
  provider: PublishingProvider,
  response: Response,
  maximumBytes: number,
): Promise<string> => {
  if (response.body === null) {
    return "";
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytesRead = 0;

  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) {
        break;
      }
      bytesRead += chunk.value.byteLength;
      if (bytesRead > maximumBytes) {
        await reader.cancel();
        throw new ProviderRuntimeError(provider, "invalid_response");
      }
      chunks.push(chunk.value);
    }
  } catch (error) {
    if (error instanceof ProviderRuntimeError) {
      throw error;
    }
    throw new ProviderRuntimeError(provider, "network", true);
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8");
};
