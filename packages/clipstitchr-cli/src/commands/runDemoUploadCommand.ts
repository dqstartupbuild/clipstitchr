import { resolve } from "node:path";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { selectProduct } from "../interactive/selectProduct.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logStep } from "../terminal/logStep.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { uploadDemoFile } from "../upload/uploadDemoFile.js";

export type DemoUploadCommandOptions = CliGlobalOptions & {
  product?: string;
  wait?: boolean;
};

export async function runDemoUploadCommand(
  filePath: string,
  options: DemoUploadCommandOptions,
) {
  logBrandHeader("Upload a demo");

  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await ensureCredentialsOrLogin(apiBaseUrl);
  const product = await selectProduct(
    credentials,
    options.product ?? config.productId,
  );
  logStep("Uploading the demo to ClipStitchr.");
  const result = await uploadDemoFile(credentials, {
    filePath: resolve(filePath),
    productId: product.id,
    wait: options.wait ?? true,
  });

  logSuccess("Demo upload started.");

  if ("clip" in result && result.clip) {
    logKeyValue("Saved to Library", result.clip.name);
  }
}
