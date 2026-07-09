import type { ProductsMenuAction } from "../productsMenu/ProductsMenuAction.js";
import { createProductsMenuChoices } from "../productsMenu/createProductsMenuChoices.js";
import type { InteractiveShellChoice } from "./InteractiveShellChoice.js";
import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";
import { createInteractiveShellNavigationChoices } from "./createInteractiveShellNavigationChoices.js";

export function createInteractiveShellProductsChoices(): InteractiveShellChoice<
  ProductsMenuAction | InteractiveShellNavigationAction
>[] {
  return [
    ...createProductsMenuChoices(),
    ...createInteractiveShellNavigationChoices({ includeBack: true }),
  ];
}
