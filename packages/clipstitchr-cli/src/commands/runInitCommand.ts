import { input } from "@inquirer/prompts";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { selectProduct } from "../interactive/selectProduct.js";
import { detectProject } from "../project/detectProject.js";
import { findRunningLocalAppUrl } from "../project/findRunningLocalAppUrl.js";

export async function runInitCommand(options: CliGlobalOptions) {
  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await ensureCredentialsOrLogin(apiBaseUrl);
  const detectedProject = await detectProject();
  const product = await selectProduct(credentials, config.productId);
  const runningUrl = await findRunningLocalAppUrl(config.target?.url);

  if (detectedProject.startCommand) {
    console.log(
      `I found a ${detectedProject.type} app in ${detectedProject.displayName}.`,
    );
  }

  const start = await input({
    default: config.target?.start ?? detectedProject.startCommand,
    message: "How do you run this app locally?",
  });
  const url = await input({
    default: runningUrl ?? config.target?.url ?? "http://localhost:3000",
    message: "What local URL should I record?",
  });

  await writeProjectConfig({
    ...config,
    apiBaseUrl,
    productId: product.id,
    recording: {
      durationLimitSeconds: config.recording?.durationLimitSeconds ?? 60,
      format: "vertical",
    },
    target: {
      start,
      type: detectedProject.type,
      url,
    },
  });

  console.log("Saved .clipstitchr.yml.");
}
