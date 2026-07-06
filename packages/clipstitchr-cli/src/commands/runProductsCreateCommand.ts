import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { createProductPrompt } from "../interactive/createProductPrompt.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";

type ProductsCreateOptions = CliGlobalOptions & {
  use?: boolean;
};

export async function runProductsCreateCommand(options: ProductsCreateOptions) {
  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await ensureCredentialsOrLogin(apiBaseUrl);
  const product = await createProductPrompt(credentials);

  console.log(`Created product: ${product.name}`);
  console.log(`Product ID: ${product.id}`);

  if (!options.use) {
    return;
  }

  await writeProjectConfig({
    ...config,
    apiBaseUrl,
    productId: product.id,
  });
  console.log("Saved this product for the repo.");
}
