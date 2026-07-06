import { input } from "@inquirer/prompts";
import { createProduct } from "../api/createProduct.js";
import type { ProductSummary } from "../api/ProductSummary.js";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";

export async function createProductPrompt(
  credentials: ClipstitchrCredentials,
): Promise<ProductSummary> {
  const name = await input({ message: "Product name:" });
  const productDetails = await input({
    message: "What does it help people do?",
  });
  const audienceDetails = await input({
    message: "Who is it for?",
  });
  const { product } = await createProduct(credentials, {
    audienceDetails,
    name,
    productDetails,
  });

  return product;
}
