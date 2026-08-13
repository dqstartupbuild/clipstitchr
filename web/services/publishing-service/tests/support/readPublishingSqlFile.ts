import { readFile } from "node:fs/promises";

export const readPublishingSqlFile = (relativePath: string): Promise<string> =>
  readFile(new URL(relativePath, import.meta.url), "utf8");
