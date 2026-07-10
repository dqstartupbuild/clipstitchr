import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { ProductsMenuAction } from "./ProductsMenuAction.js";
import type { ProductsMenuServices } from "./ProductsMenuServices.js";

export async function runProductsMenuAction(input: {
  action: ProductsMenuAction;
  options: CliGlobalOptions;
  services: ProductsMenuServices;
}) {
  if (input.action === "list") {
    await input.services.runList(input.options);
    return;
  }

  if (input.action === "create") {
    await input.services.runCreate(input.options);
    return;
  }

  if (input.action === "use") {
    await input.services.runUse(undefined, input.options);
    return;
  }

  throw new Error(`Unknown products menu action: ${input.action}.`);
}
