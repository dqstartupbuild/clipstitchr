import { confirm, input, select } from "@inquirer/prompts";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { selectProduct } from "../interactive/selectProduct.js";
import { detectProject } from "../project/detectProject.js";
import { scanProjectFlows } from "../project/scanProjectFlows.js";
import { recordWebDemo } from "../recording/recordWebDemo.js";
import { uploadDemoFile } from "../upload/uploadDemoFile.js";

export type DemoMakeCommandOptions = CliGlobalOptions & {
  output?: string;
  product?: string;
  start?: string;
  upload?: boolean;
  url?: string;
};

export async function runDemoMakeCommand(options: DemoMakeCommandOptions) {
  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await ensureCredentialsOrLogin(apiBaseUrl);
  const project = await detectProject();

  if (!["web", "expo"].includes(project.type)) {
    throw new Error(
      `Recording ${project.type} apps is not built into this recorder yet. Export an MP4 and run \`clipstitchr demo upload ./demo.mp4\`.`,
    );
  }

  const product = await selectProduct(
    credentials,
    options.product ?? config.productId,
  );
  const startCommand =
    options.start ??
    config.target?.start ??
    (await input({
      default: project.startCommand,
      message: "Start command:",
    }));
  const url =
    options.url ??
    config.target?.url ??
    (await input({
      default: "http://localhost:3000",
      message: "Local URL:",
    }));
  const flows = await scanProjectFlows();

  if (flows.length) {
    await select({
      choices: flows.map((flow) => ({
        name: `${flow.name}${flow.path ? ` (${flow.path})` : ""}`,
        value: flow.name,
      })),
      message: "Pick the flow you want to record first:",
    });
  }

  const recording = await recordWebDemo({
    outputPath: options.output,
    startCommand,
    url,
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
      start: startCommand,
      type: project.type,
      url,
    },
  });

  console.log(`Saved MP4: ${recording.outputPath}`);

  const shouldUpload =
    options.upload ??
    (await confirm({
      default: true,
      message: "Upload this demo to ClipStitchr?",
    }));

  if (!shouldUpload) {
    return;
  }

  await uploadDemoFile(credentials, {
    filePath: recording.outputPath,
    productId: product.id,
    wait: true,
  });
  console.log("Uploaded to your Demo library.");
}
