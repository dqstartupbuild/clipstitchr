import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";

export async function getCommandCredentials(options: CliGlobalOptions) {
  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);

  return await ensureCredentialsOrLogin(apiBaseUrl);
}
