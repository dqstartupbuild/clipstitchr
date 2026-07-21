import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function writeHookLabTemporaryImage(
  bytes: Uint8Array,
  contentType: string,
) {
  const extension =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  const filePath = join(
    tmpdir(),
    `clipstitchr-hook-lab-slide-${randomUUID()}.${extension}`,
  );

  await writeFile(filePath, bytes);

  return filePath;
}
