import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { login } from "../auth/login.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";

export async function runLoginCommand(options: CliGlobalOptions) {
  const config = await readProjectConfig();

  await login(resolveApiBaseUrl(config, options.api));
}
