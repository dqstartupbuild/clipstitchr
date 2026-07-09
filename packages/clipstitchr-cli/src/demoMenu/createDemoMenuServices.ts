import { runDemoAgentCheckCommand } from "../commands/runDemoAgentCheckCommand.js";
import { runDemoAgentEditCommand } from "../commands/runDemoAgentEditCommand.js";
import { runDemoAgentExportLogCommand } from "../commands/runDemoAgentExportLogCommand.js";
import { runDemoAgentInitCommand } from "../commands/runDemoAgentInitCommand.js";
import { runDemoAgentRunCommand } from "../commands/runDemoAgentRunCommand.js";
import { runDemoGuideDeleteCommand } from "../commands/runDemoGuideDeleteCommand.js";
import { runDemoGuideEditCommand } from "../commands/runDemoGuideEditCommand.js";
import { runDemoGuideGenerateCommand } from "../commands/runDemoGuideGenerateCommand.js";
import { runDemoGuideListCommand } from "../commands/runDemoGuideListCommand.js";
import { runDemoGuideShowCommand } from "../commands/runDemoGuideShowCommand.js";
import { runDemoMakeCommand } from "../commands/runDemoMakeCommand.js";
import { runDemoUploadCommand } from "../commands/runDemoUploadCommand.js";
import { runNativeHelperInstallCommand } from "../commands/runNativeHelperInstallCommand.js";
import type { DemoMenuServices } from "./DemoMenuServices.js";

export function createDemoMenuServices(): DemoMenuServices {
  return {
    runAgent: runDemoAgentRunCommand,
    runGuideCreate: runDemoGuideGenerateCommand,
    runGuideDelete: runDemoGuideDeleteCommand,
    runGuideEdit: runDemoGuideEditCommand,
    runGuideList: runDemoGuideListCommand,
    runGuideShow: runDemoGuideShowCommand,
    runLogs: runDemoAgentExportLogCommand,
    runManual: runDemoMakeCommand,
    runNativeSetup: runNativeHelperInstallCommand,
    runPolicyCheck: runDemoAgentCheckCommand,
    runPolicyEdit: runDemoAgentEditCommand,
    runPolicyInit: runDemoAgentInitCommand,
    runUpload: runDemoUploadCommand,
  };
}
