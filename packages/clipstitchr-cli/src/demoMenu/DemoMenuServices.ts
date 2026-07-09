import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";

export type DemoMenuServices = {
  runAgent: (options: CliGlobalOptions & { guide?: string }) => Promise<void>;
  runGuideCreate: (options: CliGlobalOptions) => Promise<void>;
  runGuideDelete: (reference: string, options: CliGlobalOptions) => Promise<void>;
  runGuideEdit: (reference: string) => Promise<void>;
  runGuideList: (options: CliGlobalOptions) => Promise<void>;
  runGuideShow: (reference: string) => Promise<void>;
  runLogs: (
    runId: string,
    options: CliGlobalOptions,
  ) => Promise<void>;
  runManual: (options: CliGlobalOptions) => Promise<void>;
  runNativeSetup: () => Promise<void>;
  runPolicyCheck: (options: CliGlobalOptions) => Promise<void>;
  runPolicyEdit: (options: CliGlobalOptions) => Promise<void>;
  runPolicyInit: (options: CliGlobalOptions) => Promise<void>;
  runUpload: (filePath: string, options: CliGlobalOptions) => Promise<void>;
};
