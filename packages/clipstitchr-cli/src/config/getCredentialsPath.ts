import { homedir } from "node:os";
import { join } from "node:path";
import { clipstitchrDirectoryName } from "./clipstitchrDirectoryName.js";

export function getCredentialsPath() {
  return join(homedir(), clipstitchrDirectoryName, "credentials.json");
}
