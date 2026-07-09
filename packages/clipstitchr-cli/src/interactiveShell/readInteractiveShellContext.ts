import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { hasProjectConfig } from "../config/hasProjectConfig.js";
import { readCredentials } from "../config/readCredentials.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { getInteractiveShellContext } from "./getInteractiveShellContext.js";

export async function readInteractiveShellContext(options: CliGlobalOptions) {
  const [config, credentials, projectConfigExists] = await Promise.all([
    readProjectConfig(),
    readCredentials(),
    hasProjectConfig(),
  ]);

  return getInteractiveShellContext({
    api: options.api,
    config,
    credentials,
    hasProjectConfig: projectConfigExists,
  });
}
