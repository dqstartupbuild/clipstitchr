import { readFile } from "node:fs/promises";
import type { ClipstitchrCredentials } from "./ClipstitchrCredentials.js";
import { getCredentialsPath } from "./getCredentialsPath.js";

export async function readCredentials() {
  try {
    return JSON.parse(
      await readFile(getCredentialsPath(), "utf8"),
    ) as ClipstitchrCredentials;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
