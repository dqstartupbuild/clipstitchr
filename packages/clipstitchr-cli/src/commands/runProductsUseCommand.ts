import { select } from "@inquirer/prompts";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { listProducts } from "../api/listProducts.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { createProductConfigSummary } from "../config/createProductConfigSummary.js";
import { createProductPrompt } from "../interactive/createProductPrompt.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logSuccess } from "../terminal/logSuccess.js";

type ProductsUseOptions = CliGlobalOptions;

export async function runProductsUseCommand(
  productId: string | undefined,
  options: ProductsUseOptions,
) {
  logBrandHeader("Choose repo product");

  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await ensureCredentialsOrLogin(apiBaseUrl);
  const { products } = await listProducts(credentials);
  const selectedProduct = productId
    ? products.find((product) => product.id === productId)
    : null;

  if (productId && !selectedProduct) {
    throw new Error("That product was not found in your account.");
  }

  const product =
    selectedProduct ??
    (await (async () => {
      if (!products.length) {
        logInfo("No products yet. Add one now.");
        return await createProductPrompt(credentials);
      }

      const selectedId = await select({
        choices: [
          ...products.map((candidate) => ({
            name: candidate.name,
            value: candidate.id,
          })),
          {
            name: "Add a new product",
            value: "__new__",
          },
        ],
        message: "Which product should this repo use?",
      });

      if (selectedId === "__new__") {
        return await createProductPrompt(credentials);
      }

      return (
        products.find((candidate) => candidate.id === selectedId) ?? products[0]
      );
    })());

  await writeProjectConfig({
    ...config,
    apiBaseUrl,
    product: createProductConfigSummary(product),
    productId: product.id,
  });
  logSuccess(`This repo now uses ${product.name}.`);
}
