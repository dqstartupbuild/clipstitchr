import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";

export type ProductsMenuServices = {
  runCreate: (options: CliGlobalOptions) => Promise<void>;
  runList: (options: CliGlobalOptions) => Promise<void>;
  runUse: (
    productId: string | undefined,
    options: CliGlobalOptions,
  ) => Promise<void>;
};
