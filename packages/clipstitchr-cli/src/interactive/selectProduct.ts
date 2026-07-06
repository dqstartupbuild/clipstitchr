import { select } from "@inquirer/prompts";
import { listProducts } from "../api/listProducts.js";
import type { ProductSummary } from "../api/ProductSummary.js";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { logInfo } from "../terminal/logInfo.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { createProductPrompt } from "./createProductPrompt.js";

export async function selectProduct(
  credentials: ClipstitchrCredentials,
  preferredProductId?: string,
): Promise<ProductSummary> {
  const { products } = await listProducts(credentials);
  const preferredProduct = products.find(
    (product) => product.id === preferredProductId,
  );

  if (preferredProduct) {
    return preferredProduct;
  }

  if (!products.length) {
    logInfo("No products yet. Add one now.");
    return await createProductPrompt(credentials);
  }

  if (products.length === 1) {
    logSuccess(`Using product ${products[0].name}.`);
    return products[0];
  }

  const selectedId = await select({
    choices: [
      ...products.map((product) => ({
        name: product.name,
        value: product.id,
      })),
      {
        name: "Add a new product",
        value: "__new__",
      },
    ],
    message: "Which product is this demo for?",
  });

  if (selectedId === "__new__") {
    return await createProductPrompt(credentials);
  }

  return products.find((product) => product.id === selectedId) ?? products[0];
}
