import type { ProductsMenuServices } from "../../src/productsMenu/ProductsMenuServices.js";

export function createProductsMenuTestServices(calls: string[]) {
  return {
    runCreate: async () => {
      calls.push("create");
    },
    runList: async () => {
      calls.push("list");
    },
    runUse: async (productId) => {
      calls.push(`use:${productId ?? "choose"}`);
    },
  } satisfies ProductsMenuServices;
}
