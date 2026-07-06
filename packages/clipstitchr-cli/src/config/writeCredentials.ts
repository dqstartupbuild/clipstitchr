import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { ClipstitchrCredentials } from "./ClipstitchrCredentials.js";
import { getCredentialsPath } from "./getCredentialsPath.js";

export async function writeCredentials(credentials: ClipstitchrCredentials) {
  const credentialsPath = getCredentialsPath();

  await mkdir(dirname(credentialsPath), { recursive: true, mode: 0o700 });
  await writeFile(
    credentialsPath,
    `${JSON.stringify(credentials, null, 2)}\n`,
    { encoding: "utf8", mode: 0o600 },
  );
}
