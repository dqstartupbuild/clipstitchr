import { runProductsCreateCommand } from "../commands/runProductsCreateCommand.js";
import { runProductsListCommand } from "../commands/runProductsListCommand.js";
import { runProductsUseCommand } from "../commands/runProductsUseCommand.js";
import type { ProductsMenuServices } from "./ProductsMenuServices.js";

export function createProductsMenuServices(): ProductsMenuServices {
  return {
    runCreate: runProductsCreateCommand,
    runList: runProductsListCommand,
    runUse: runProductsUseCommand,
  };
}
