import { listProducts } from "../api/listProducts.js";
import { ensureCredentials } from "../auth/ensureCredentials.js";

export async function runProductsListCommand() {
  const credentials = await ensureCredentials();
  const { products } = await listProducts(credentials);

  if (!products.length) {
    console.log("No products yet.");
    return;
  }

  for (const product of products) {
    console.log(`${product.id}\t${product.name}`);
  }
}
