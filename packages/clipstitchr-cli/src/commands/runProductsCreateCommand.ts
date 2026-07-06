import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { createProductPrompt } from "../interactive/createProductPrompt.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";

type ProductsCreateOptions = CliGlobalOptions & {
  use?: boolean;
};

export async function runProductsCreateCommand(options: ProductsCreateOptions) {
  logBrandHeader("Create a product");

  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await ensureCredentialsOrLogin(apiBaseUrl);
  const product = await createProductPrompt(credentials);

  logSuccess("Created product.");
  logKeyValue("Name", product.name);
  logKeyValue("Product ID", product.id);

  if (!options.use) {
    return;
  }

  await writeProjectConfig({
    ...config,
    apiBaseUrl,
    productId: product.id,
  });
  logSuccess("Saved this product for the repo.");
}
