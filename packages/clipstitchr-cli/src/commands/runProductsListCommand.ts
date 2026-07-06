import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { listProducts } from "../api/listProducts.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";

export async function runProductsListCommand(options: CliGlobalOptions) {
  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await ensureCredentialsOrLogin(apiBaseUrl);
  const { products } = await listProducts(credentials);

  if (!products.length) {
    console.log("No products yet.");
    return;
  }

  for (const product of products) {
    console.log(`${product.id}\t${product.name}`);
  }
}
