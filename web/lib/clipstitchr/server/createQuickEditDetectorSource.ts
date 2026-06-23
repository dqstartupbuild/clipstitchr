import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink, writeFile } from "node:fs/promises";
import type { QuickEditDetectorSource } from "@/lib/clipstitchr/types/QuickEditDetectorSource";

export async function createQuickEditDetectorSource({
  file,
  sourceUrl,
}: {
  file?: File;
  sourceUrl?: string;
}): Promise<QuickEditDetectorSource | null> {
  if (sourceUrl) {
    return { input: sourceUrl };
  }

  if (!file) {
    return null;
  }

  const input = join(
    tmpdir(),
    `clipstitchr-quick-edit-detector-${randomUUID()}.mp4`,
  );

  await writeFile(input, Buffer.from(await file.arrayBuffer()));

  return {
    cleanup: async () => {
      await unlink(input).catch(() => undefined);
    },
    input,
  };
}
