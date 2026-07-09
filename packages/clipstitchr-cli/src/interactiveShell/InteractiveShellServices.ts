import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { DemoAgentCommandOptions } from "../commands/DemoAgentCommandOptions.js";
import type { DemoAutoCommandOptions } from "../commands/DemoAutoCommandOptions.js";
import type { DemoMakeCommandOptions } from "../commands/runDemoMakeCommand.js";
import type { DemoUploadCommandOptions } from "../commands/runDemoUploadCommand.js";
import type { NativeInitCommandOptions } from "../commands/NativeInitCommandOptions.js";
import type { QueueContentCommandOptions } from "../commands/QueueContentCommandOptions.js";
import type { DemoMenuServices } from "../demoMenu/DemoMenuServices.js";
import type { ProductsMenuServices } from "../productsMenu/ProductsMenuServices.js";
import type { QueueMenuServices } from "../queueMenu/QueueMenuServices.js";

export type InteractiveShellServices = {
  demo: DemoMenuServices;
  products: ProductsMenuServices;
  queue: QueueMenuServices;
  runDemoAgent: (options: DemoAgentCommandOptions) => Promise<void>;
  runDemoAuto: (options: DemoAutoCommandOptions) => Promise<void>;
  runDemoGuideSaveInstructions: (
    reference: string,
    options: CliGlobalOptions & { output?: string },
  ) => Promise<void>;
  runDemoManual: (options: DemoMakeCommandOptions) => Promise<void>;
  runDemoUpload: (
    filePath: string,
    options: DemoUploadCommandOptions,
  ) => Promise<void>;
  runDoctor: () => Promise<void>;
  runLink: (options: CliGlobalOptions) => Promise<void>;
  runLogin: (options: CliGlobalOptions) => Promise<void>;
  runLogout: () => Promise<void>;
  runNativeCheck: () => Promise<void>;
  runNativeInit: (options?: NativeInitCommandOptions) => Promise<void>;
  runProductsCreate: (options: CliGlobalOptions & { use?: boolean }) => Promise<void>;
  runProductsList: (options: CliGlobalOptions) => Promise<void>;
  runProductsUse: (
    productId: string | undefined,
    options: CliGlobalOptions,
  ) => Promise<void>;
  runQueueAll: (options: CliGlobalOptions & { accounts?: string; product?: string }) => Promise<void>;
  runQueueList: (options: CliGlobalOptions) => Promise<void>;
  runQueueStitch: (
    stitchId: string | undefined,
    options: QueueContentCommandOptions,
  ) => Promise<void>;
  runQueueSwipe: (
    swipeId: string | undefined,
    options: QueueContentCommandOptions,
  ) => Promise<void>;
  runStatus: () => Promise<void>;
  runStitchrNew: (
    options: CliGlobalOptions & {
      product?: string;
      sound?: string;
      template?: string;
      timeZone?: string;
    },
  ) => Promise<void>;
  runSwiprNew: (options: CliGlobalOptions & { product?: string }) => Promise<void>;
  runUnlink: () => Promise<void>;
  runUpdate: () => Promise<void>;
};
