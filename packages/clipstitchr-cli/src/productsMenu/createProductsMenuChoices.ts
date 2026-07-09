import type { ProductsMenuChoice } from "./ProductsMenuChoice.js";

export function createProductsMenuChoices(): ProductsMenuChoice[] {
  return [
    {
      name: "Show my products",
      value: "list",
    },
    {
      name: "Create a product",
      value: "create",
    },
    {
      name: "Use a product for this repo",
      value: "use",
    },
  ];
}
