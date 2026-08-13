import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

export async function getStudioClipsFileSha256(localPath: string): Promise<{
  base64: string;
  hex: string;
}> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(localPath)) {
    hash.update(chunk as Buffer);
  }
  const digest = hash.digest();
  return { base64: digest.toString("base64"), hex: digest.toString("hex") };
}
