import { select } from "@inquirer/prompts";
import { listProducts } from "../api/listProducts.js";
import type { ProductSummary } from "../api/ProductSummary.js";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
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
    console.log("No products yet. Add one now.");
    return await createProductPrompt(credentials);
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
