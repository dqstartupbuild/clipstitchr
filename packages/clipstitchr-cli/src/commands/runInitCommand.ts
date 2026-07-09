import { confirm, input } from "@inquirer/prompts";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { createProductConfigSummary } from "../config/createProductConfigSummary.js";
import { selectProduct } from "../interactive/selectProduct.js";
import { detectProject } from "../project/detectProject.js";
import { findRunningLocalAppUrl } from "../project/findRunningLocalAppUrl.js";
import { createAppContextConfig } from "../project/createAppContextConfig.js";
import { scanAndWriteAppContext } from "../project/scanAndWriteAppContext.js";
import { resolveRecordingGuidance } from "../recording/resolveRecordingGuidance.js";
import { defaultDemoAgentDriver } from "../demoAgent/defaultDemoAgentDriver.js";
import { readOpenAiApiKey } from "../demoAgent/readOpenAiApiKey.js";
import { resolveOpenAiComputerModel } from "../demoAgent/resolveOpenAiComputerModel.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { logWarning } from "../terminal/logWarning.js";

export async function runInitCommand(options: CliGlobalOptions) {
  logBrandHeader("Connect this repo");

  const config = await readProjectConfig();
  const recordingGuidance = resolveRecordingGuidance(config.recording);
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await ensureCredentialsOrLogin(apiBaseUrl);
  const detectedProject = await detectProject();
  const product = await selectProduct(credentials, config.productId);
  const runningUrl = await findRunningLocalAppUrl(config.target?.url);
  const appContext = await scanAndWriteAppContext({
    project: detectedProject,
  });

  if (detectedProject.startCommand) {
    logInfo(
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
  const useOpenAiComputer = await confirm({
    default: config.demoAgent?.driver === "openai-computer",
    message: "Use OpenAI Computer Use for automatic demos?",
  });
  const demoAgentDriver = useOpenAiComputer
    ? "openai-computer"
    : defaultDemoAgentDriver;

  if (useOpenAiComputer && !readOpenAiApiKey()) {
    logWarning(
      "OPENAI_API_KEY is not set. Automatic demos will fall back to the structured planner until you add it.",
    );
  }

  await writeProjectConfig({
    ...config,
    apiBaseUrl,
    appContext: createAppContextConfig(appContext),
    demoAgent: {
      driver: demoAgentDriver,
      openai: useOpenAiComputer
        ? {
            model: resolveOpenAiComputerModel(config.demoAgent?.openai?.model),
          }
        : config.demoAgent?.openai,
    },
    product: createProductConfigSummary(product),
    productId: product.id,
    recording: {
      format: "full-size",
      longRecordingWarningSeconds:
        recordingGuidance.longRecordingWarningSeconds,
      recommendedDurationSeconds: recordingGuidance.recommendedDurationSeconds,
    },
    target: {
      start,
      type: detectedProject.type,
      url,
    },
  });

  logSuccess("Saved repo settings.");
  logKeyValue("Config", ".clipstitchr.yml");
  logKeyValue("App context", ".clipstitchr/app-context.json");
}
