import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function writeHookLabTemporaryVideo(bytes: Uint8Array) {
  const filePath = join(
    tmpdir(),
    `clipstitchr-hook-lab-${randomUUID()}.video`,
  );

  await writeFile(filePath, bytes);

  return filePath;
}
