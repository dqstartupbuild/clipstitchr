import { runDemoAgentCommand } from "../commands/runDemoAgentCommand.js";
import { runDemoAutoCommand } from "../commands/runDemoAutoCommand.js";
import { runDemoGuideExportInstructionsCommand } from "../commands/runDemoGuideExportInstructionsCommand.js";
import { runDemoMakeCommand } from "../commands/runDemoMakeCommand.js";
import { runDemoUploadCommand } from "../commands/runDemoUploadCommand.js";
import { runDoctorCommand } from "../commands/runDoctorCommand.js";
import { runInitCommand } from "../commands/runInitCommand.js";
import { runLoginCommand } from "../commands/runLoginCommand.js";
import { runLogoutCommand } from "../commands/runLogoutCommand.js";
import { runNativeHelperCheckCommand } from "../commands/runNativeHelperCheckCommand.js";
import { runNativeInitCommand } from "../commands/runNativeInitCommand.js";
import { runProductsCreateCommand } from "../commands/runProductsCreateCommand.js";
import { runProductsListCommand } from "../commands/runProductsListCommand.js";
import { runProductsUseCommand } from "../commands/runProductsUseCommand.js";
import { runQueueAllCommand } from "../commands/runQueueAllCommand.js";
import { runQueueListCommand } from "../commands/runQueueListCommand.js";
import { runQueueStitchCommand } from "../commands/runQueueStitchCommand.js";
import { runQueueSwipeCommand } from "../commands/runQueueSwipeCommand.js";
import { runStatusCommand } from "../commands/runStatusCommand.js";
import { runStitchrBatchCommand } from "../commands/runStitchrBatchCommand.js";
import { runSwiprBatchCommand } from "../commands/runSwiprBatchCommand.js";
import { runUnlinkCommand } from "../commands/runUnlinkCommand.js";
import { runUpdateCommand } from "../commands/runUpdateCommand.js";
import { createDemoMenuServices } from "../demoMenu/createDemoMenuServices.js";
import { createProductsMenuServices } from "../productsMenu/createProductsMenuServices.js";
import { createQueueMenuServices } from "../queueMenu/createQueueMenuServices.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";

export function createInteractiveShellServices(): InteractiveShellServices {
  return {
    demo: createDemoMenuServices(),
    products: createProductsMenuServices(),
    queue: createQueueMenuServices(),
    runDemoAgent: runDemoAgentCommand,
    runDemoAuto: runDemoAutoCommand,
    runDemoGuideSaveInstructions: runDemoGuideExportInstructionsCommand,
    runDemoManual: runDemoMakeCommand,
    runDemoUpload: runDemoUploadCommand,
    runDoctor: runDoctorCommand,
    runLink: runInitCommand,
    runLogin: runLoginCommand,
    runLogout: runLogoutCommand,
    runNativeCheck: runNativeHelperCheckCommand,
    runNativeInit: runNativeInitCommand,
    runProductsCreate: runProductsCreateCommand,
    runProductsList: runProductsListCommand,
    runProductsUse: runProductsUseCommand,
    runQueueAll: runQueueAllCommand,
    runQueueList: runQueueListCommand,
    runQueueStitch: runQueueStitchCommand,
    runQueueSwipe: runQueueSwipeCommand,
    runStatus: runStatusCommand,
    runStitchrNew: runStitchrBatchCommand,
    runSwiprNew: runSwiprBatchCommand,
    runUnlink: runUnlinkCommand,
    runUpdate: runUpdateCommand,
  };
}
