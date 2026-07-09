import { Command } from "commander";
import { addDemoManualCommandOptions } from "./addDemoManualCommandOptions.js";
import { addStitchrNewCommandOptions } from "./addStitchrNewCommandOptions.js";
import { addSwiprNewCommandOptions } from "./addSwiprNewCommandOptions.js";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { runDoctorCommand } from "./runDoctorCommand.js";
import { runDemoAgentCommand } from "./runDemoAgentCommand.js";
import { runDemoAgentCheckCommand } from "./runDemoAgentCheckCommand.js";
import { runDemoAgentEditCommand } from "./runDemoAgentEditCommand.js";
import { runDemoAgentExportLogCommand } from "./runDemoAgentExportLogCommand.js";
import { runDemoAgentInitCommand } from "./runDemoAgentInitCommand.js";
import { runDemoAgentRunCommand } from "./runDemoAgentRunCommand.js";
import { runDemoAutoCommand } from "./runDemoAutoCommand.js";
import { runDemoGuideDeleteCommand } from "./runDemoGuideDeleteCommand.js";
import { runDemoGuideEditCommand } from "./runDemoGuideEditCommand.js";
import { runDemoGuideExportInstructionsCommand } from "./runDemoGuideExportInstructionsCommand.js";
import { runDemoGuideGenerateCommand } from "./runDemoGuideGenerateCommand.js";
import { runDemoGuideListCommand } from "./runDemoGuideListCommand.js";
import { runDemoGuideShowCommand } from "./runDemoGuideShowCommand.js";
import { runDemoMakeCommand } from "./runDemoMakeCommand.js";
import { runDemoUploadCommand } from "./runDemoUploadCommand.js";
import { runHelpCommand } from "./runHelpCommand.js";
import { runInitCommand } from "./runInitCommand.js";
import { runLibraryClipsCommand } from "./runLibraryClipsCommand.js";
import { runLibraryStitchesCommand } from "./runLibraryStitchesCommand.js";
import { runLibrarySwipesCommand } from "./runLibrarySwipesCommand.js";
import { runLoginCommand } from "./runLoginCommand.js";
import { runLogoutCommand } from "./runLogoutCommand.js";
import { runNativeHelperBuildCommand } from "./runNativeHelperBuildCommand.js";
import { runNativeHelperCheckCommand } from "./runNativeHelperCheckCommand.js";
import { runNativeHelperInstallCommand } from "./runNativeHelperInstallCommand.js";
import { runNativeInitCommand } from "./runNativeInitCommand.js";
import { runProductsCreateCommand } from "./runProductsCreateCommand.js";
import { runProductsListCommand } from "./runProductsListCommand.js";
import { runProductsUseCommand } from "./runProductsUseCommand.js";
import { runQueueAllCommand } from "./runQueueAllCommand.js";
import { runQueueListCommand } from "./runQueueListCommand.js";
import { runQueueStitchCommand } from "./runQueueStitchCommand.js";
import { runQueueSwipeCommand } from "./runQueueSwipeCommand.js";
import { runScanCommand } from "./runScanCommand.js";
import { runStatusCommand } from "./runStatusCommand.js";
import { runStitchrBatchCommand } from "./runStitchrBatchCommand.js";
import { runSwiprBatchCommand } from "./runSwiprBatchCommand.js";
import { runUnlinkCommand } from "./runUnlinkCommand.js";
import { runUpdateCommand } from "./runUpdateCommand.js";
import { clipstitchrCliDescription } from "../config/clipstitchrCliDescription.js";
import { readCliPackageVersion } from "../config/readCliPackageVersion.js";
import { runDemoMenuCommand } from "../demoMenu/runDemoMenuCommand.js";
import { runInteractiveCommand } from "../interactive/runInteractiveCommand.js";
import { runQueueMenuCommand } from "../queueMenu/runQueueMenuCommand.js";

export async function runCli(argv: string[]) {
  const packageVersion = await readCliPackageVersion();
  const program = new Command();

  program
    .name("clipstitchr")
    .description(clipstitchrCliDescription)
    .option("--api <url>", "Use a ClipStitchr app URL")
    .option("--plain", "Print plain output without terminal colors")
    .version(packageVersion);

  program.hook("preAction", () => {
    if (program.opts<CliGlobalOptions>().plain) {
      process.env.CLIPSTITCHR_PLAIN = "1";
    }
  });

  program
    .command("help")
    .argument("[command...]", "Command to show help for")
    .description("Show CLI help")
    .action((commandPath = []) => {
      runHelpCommand(program, commandPath);
    });

  program
    .command("link")
    .description("Connect this repo to ClipStitchr")
    .action(async () => {
      await runInitCommand(program.opts());
    });

  program
    .command("login")
    .description("Connect this machine to your ClipStitchr account")
    .action(async () => {
      await runLoginCommand(program.opts());
    });

  program
    .command("logout")
    .description("Disconnect this machine")
    .action(runLogoutCommand);

  program
    .command("init")
    .description("Set up this repo for demo recording")
    .action(async () => {
      await runInitCommand(program.opts());
    });

  program
    .command("unlink")
    .description("Disconnect this repo from ClipStitchr")
    .action(runUnlinkCommand);

  program
    .command("scan")
    .description("Find likely demo flows")
    .action(runScanCommand);

  program
    .command("status")
    .description("Show account, repo, and recorder setup")
    .action(runStatusCommand);

  program
    .command("update")
    .description("Check for a newer ClipStitchr CLI")
    .action(runUpdateCommand);

  const demo = program
    .command("demo")
    .description("Make or upload demos")
    .action(async () => {
      await runDemoMenuCommand(program.opts());
    });

  demo
    .command("auto", { hidden: true })
    .description("Legacy alias for demo agent")
    .option("--audience <text>", "Who this demo is for")
    .option(
      "--driver <driver>",
      "Use structured-planner or openai-computer for browser control",
    )
    .option("--goal <text>", "What the demo should show")
    .option("--openai-mode <mode>", "Use direct or relay for OpenAI Computer Use")
    .option("--product <id>", "ClipStitchr product ID")
    .option("--start <command>", "Start command")
    .option("--surface <surface>", "Use browser or macos-window")
    .option("--steps <count>", "Guide step count from 3 to 8")
    .option("--target <local-or-live>", "Use local or live as the recording target")
    .option("--url <url>", "App URL")
    .action(async (options) => {
      await runDemoAutoCommand({ ...program.opts(), ...options });
    });

  const demoAgent = demo
    .command("agent")
    .description("Record a demo with the guarded AI agent")
    .option("--audience <text>", "Who this demo is for")
    .option("--ai-planner", "Ask ClipStitchr AI to propose each guarded action")
    .option(
      "--driver <driver>",
      "Use structured-planner or openai-computer for browser control",
    )
    .option("--goal <text>", "What the demo should show")
    .option("--guide <name-id-or-path>", "Use a saved walkthrough guide")
    .option("--openai-mode <mode>", "Use direct or relay for OpenAI Computer Use")
    .option("--upload", "Upload after recording without asking")
    .option("--no-upload", "Record only")
    .option("--product <id>", "ClipStitchr product ID")
    .option("--start <command>", "Start command")
    .option("--steps <count>", "Guide step count from 3 to 8")
    .option("--surface <surface>", "Use browser or macos-window")
    .option("--target <local-or-live>", "Use local or live as the recording target")
    .option("--url <url>", "App URL")
    .action(async (options) => {
      await runDemoAgentCommand({ ...program.opts(), ...options });
    });

  const demoPolicy = demo
    .command("policy")
    .description("Set up the local safety policy for AI demo recording");

  demoPolicy
    .command("init")
    .description("Create and review the local safety policy")
    .action(async () => {
      await runDemoAgentInitCommand(program.opts());
    });

  demoPolicy
    .command("edit")
    .description("Review and update the local safety policy")
    .action(async () => {
      await runDemoAgentEditCommand(program.opts());
    });

  demoPolicy
    .command("check")
    .description("Check the saved local safety policy")
    .action(async () => {
      await runDemoAgentCheckCommand(program.opts());
    });

  demoAgent
    .command("init", { hidden: true })
    .description("Legacy alias for demo policy init")
    .action(async () => {
      await runDemoAgentInitCommand(program.opts());
    });

  demoAgent
    .command("check", { hidden: true })
    .description("Legacy alias for demo policy check")
    .action(async () => {
      await runDemoAgentCheckCommand(program.opts());
    });

  demoAgent
    .command("run", { hidden: true })
    .description("Legacy alias for demo agent --guide")
    .requiredOption("--guide <name-id-or-path>", "Use a saved walkthrough guide")
    .option("--ai-planner", "Ask ClipStitchr AI to propose each guarded action")
    .option(
      "--driver <driver>",
      "Use structured-planner or openai-computer for browser control",
    )
    .option("--dry-run", "Validate the run without recording or uploading")
    .option("--openai-mode <mode>", "Use direct or relay for OpenAI Computer Use")
    .option("--upload", "Upload after recording without asking")
    .option("--no-upload", "Record only after review")
    .option("--product <id>", "ClipStitchr product ID for upload")
    .option("--start <command>", "Start command")
    .option("--surface <surface>", "Use browser or macos-window")
    .option("--target <local-or-live>", "Use local or live as the recording target")
    .option("--url <url>", "App URL")
    .action(async (options) => {
      await runDemoAgentRunCommand({ ...program.opts(), ...options });
    });

  demoAgent
    .command("export-log", { hidden: true })
    .argument("<runId>", "Agent run ID")
    .description("Legacy alias for demo logs")
    .option("--output <path>", "Write one JSON export file")
    .action(async (runId, options) => {
      await runDemoAgentExportLogCommand(runId, {
        ...program.opts(),
        ...options,
      });
    });

  demo
    .command("logs")
    .argument("<runId>", "Agent run ID")
    .description("Show local logs for an automated demo run")
    .option("--output <path>", "Write one compact JSON file")
    .action(async (runId, options) => {
      await runDemoAgentExportLogCommand(runId, {
        ...program.opts(),
        ...options,
      });
    });

  const demoGuide = demo
    .command("guide")
    .description("Create and manage walkthrough guides");

  demoGuide
    .command("create")
    .description("Create a walkthrough guide")
    .option("--product <id>", "Use this product ID")
    .action(async (options) => {
      await runDemoGuideGenerateCommand({ ...program.opts(), ...options });
    });

  demoGuide
    .command("generate", { hidden: true })
    .description("Legacy alias for demo guide create")
    .option("--product <id>", "Use this product ID")
    .action(async (options) => {
      await runDemoGuideGenerateCommand({ ...program.opts(), ...options });
    });

  demoGuide
    .command("list")
    .description("List saved walkthrough guides")
    .option("--all", "Show guides for every product")
    .action(async (options) => {
      await runDemoGuideListCommand({ ...program.opts(), ...options });
    });

  demoGuide
    .command("show")
    .argument("<guide>", "Guide name, ID, or guide file path")
    .description("Show a saved walkthrough guide")
    .action(async (guide) => {
      await runDemoGuideShowCommand(guide);
    });

  demoGuide
    .command("edit")
    .argument("<guide>", "Guide name, ID, or guide file path")
    .description("Edit a walkthrough guide")
    .action(async (guide) => {
      await runDemoGuideEditCommand(guide);
    });

  demoGuide
    .command("delete")
    .argument("<guide>", "Guide name, ID, or guide file path")
    .description("Delete a walkthrough guide")
    .option("--yes", "Delete without asking")
    .action(async (guide, options) => {
      await runDemoGuideDeleteCommand(guide, {
        ...program.opts(),
        ...options,
      });
    });

  demoGuide
    .command("save-instructions")
    .argument("<guide>", "Guide name, ID, or guide file path")
    .description("Save local instructions for a guide")
    .option("--output <path>", "Write instructions to this Markdown file")
    .action(async (guide, options) => {
      await runDemoGuideExportInstructionsCommand(guide, {
        ...program.opts(),
        ...options,
      });
    });

  demoGuide
    .command("export-instructions", { hidden: true })
    .argument("<guide>", "Guide name, ID, or guide file path")
    .description("Legacy alias for demo guide save-instructions")
    .option("--output <path>", "Write instructions to this Markdown file")
    .action(async (guide, options) => {
      await runDemoGuideExportInstructionsCommand(guide, {
        ...program.opts(),
        ...options,
      });
    });

  addDemoManualCommandOptions(
    demo.command("manual").description("Record a demo yourself"),
  ).action(async (options) => {
    await runDemoMakeCommand({ ...program.opts(), ...options });
  });

  addDemoManualCommandOptions(
    demo
      .command("make", { hidden: true })
      .description("Legacy alias for demo manual"),
  ).action(async (options) => {
    await runDemoMakeCommand({ ...program.opts(), ...options });
  });

  demo
    .command("upload")
    .argument("<file>", "MP4, MOV, or WebM demo file")
    .description("Upload an existing demo")
    .option("--no-wait", "Do not wait for processing")
    .option("--product <id>", "Use this product ID")
    .action(async (filePath, options) => {
      await runDemoUploadCommand(filePath, { ...program.opts(), ...options });
    });

  const native = program.command("native").description("Manage native helpers");
  native
    .command("init")
    .description("Prepare this Mac for native and window demos")
    .option("--force", "Repair or reinstall the native helper")
    .action(async (options) => {
      await runNativeInitCommand(options);
    });

  native
    .command("check")
    .description("Check native helper setup and permissions")
    .action(runNativeHelperCheckCommand);

  const nativeHelper = native
    .command("helper", { hidden: true })
    .description("Legacy native helper commands");

  nativeHelper
    .command("build", { hidden: true })
    .description("Build the macOS window helper")
    .action(runNativeHelperBuildCommand);

  nativeHelper
    .command("install", { hidden: true })
    .description("Legacy alias for native init")
    .option("--force", "Repair or reinstall the native helper")
    .action(async (options) => {
      await runNativeHelperInstallCommand(options);
    });

  nativeHelper
    .command("check", { hidden: true })
    .description("Legacy alias for native check")
    .action(runNativeHelperCheckCommand);

  const stitchr = program.command("stitchr").description("Create Stitch drafts");

  addStitchrNewCommandOptions(
    stitchr.command("new").description("Start new Stitchr work"),
  ).action(async (options) => {
    await runStitchrBatchCommand({ ...program.opts(), ...options });
  });

  addStitchrNewCommandOptions(
    stitchr
      .command("batch", { hidden: true })
      .description("Legacy alias for stitchr new"),
  ).action(async (options) => {
    await runStitchrBatchCommand({ ...program.opts(), ...options });
  });

  const swipr = program.command("swipr").description("Create Swipe drafts");

  addSwiprNewCommandOptions(
    swipr.command("new").description("Start new Swipr drafts"),
  ).action(async (options) => {
    await runSwiprBatchCommand({ ...program.opts(), ...options });
  });

  addSwiprNewCommandOptions(
    swipr
      .command("batch", { hidden: true })
      .description("Legacy alias for swipr new"),
  ).action(async (options) => {
    await runSwiprBatchCommand({ ...program.opts(), ...options });
  });

  const library = program
    .command("library", { hidden: true })
    .description("Legacy library listing commands");

  library
    .command("clips")
    .description("List saved clips and demos")
    .option("--kind <kind>", "Filter by ugc, demo, clipr, or swapr")
    .option("--limit <count>", "Limit the number of rows")
    .option("--product <id>", "Filter by product ID")
    .action(async (options) => {
      await runLibraryClipsCommand({ ...program.opts(), ...options });
    });

  library
    .command("stitches")
    .description("List saved Stitches")
    .option("--limit <count>", "Limit the number of rows")
    .option("--product <id>", "Filter by product ID")
    .option("--ready", "Only show Stitches with finished videos")
    .action(async (options) => {
      await runLibraryStitchesCommand({ ...program.opts(), ...options });
    });

  library
    .command("swipes")
    .description("List saved Swipes")
    .option("--limit <count>", "Limit the number of rows")
    .option("--product <id>", "Filter by product ID")
    .action(async (options) => {
      await runLibrarySwipesCommand({ ...program.opts(), ...options });
    });

  const queue = program
    .command("queue")
    .description("Add content to your queue")
    .option("--accounts <ids>", "Comma-separated Post Bridge account IDs")
    .option("--all", "Queue all active Stitches and Swipes")
    .option("--product <id>", "Filter by product ID")
    .action(async (options) => {
      if (options.all) {
        await runQueueAllCommand({ ...program.opts(), ...options });
        return;
      }

      await runQueueMenuCommand(program.opts());
    });

  queue
    .command("list")
    .description("Show queued Stitches and Swipes for the next 24 hours")
    .action(async () => {
      await runQueueListCommand(program.opts());
    });

  queue
    .command("stitch")
    .argument("[stitchId]", "Finished Stitch ID")
    .description("Add a finished Stitch to your Post Bridge queue")
    .option("--accounts <ids>", "Comma-separated Post Bridge account IDs")
    .option("--all", "Queue all ready active Stitches")
    .option("--caption <text>", "Post caption")
    .option("--product <id>", "Filter by product ID")
    .option("--title <text>", "Post title")
    .action(async (stitchId, options) => {
      await runQueueStitchCommand(stitchId, { ...program.opts(), ...options });
    });

  queue
    .command("swipe")
    .argument("[swipeId]", "Swipe ID")
    .description("Add a saved Swipe to your Post Bridge queue")
    .option("--accounts <ids>", "Comma-separated Post Bridge account IDs")
    .option("--all", "Queue all ready active Swipes")
    .option("--caption <text>", "Post caption")
    .option("--product <id>", "Filter by product ID")
    .option("--title <text>", "Post title")
    .action(async (swipeId, options) => {
      await runQueueSwipeCommand(swipeId, { ...program.opts(), ...options });
    });

  const products = program.command("products").description("Manage products");

  products
    .command("list")
    .description("List saved products")
    .action(async () => {
      await runProductsListCommand(program.opts());
    });

  products
    .command("create")
    .description("Create a new product")
    .option("--use", "Use the new product for this repo")
    .action(async (options) => {
      await runProductsCreateCommand({ ...program.opts(), ...options });
    });

  products
    .command("use")
    .argument("[productId]", "Product ID to use")
    .description("Choose the product this repo records")
    .action(async (productId) => {
      await runProductsUseCommand(productId, program.opts());
    });

  program
    .command("doctor")
    .description("Check CLI setup")
    .action(runDoctorCommand);

  program.action(async () => {
    await runInteractiveCommand(program.opts());
  });

  await program.parseAsync(argv);
}
