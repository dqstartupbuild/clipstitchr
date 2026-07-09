import { Command } from "commander";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { runDoctorCommand } from "./runDoctorCommand.js";
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
import { runProductsCreateCommand } from "./runProductsCreateCommand.js";
import { runProductsListCommand } from "./runProductsListCommand.js";
import { runProductsUseCommand } from "./runProductsUseCommand.js";
import { runQueueStitchCommand } from "./runQueueStitchCommand.js";
import { runScanCommand } from "./runScanCommand.js";
import { runStatusCommand } from "./runStatusCommand.js";
import { runStitchrBatchCommand } from "./runStitchrBatchCommand.js";
import { runSwiprBatchCommand } from "./runSwiprBatchCommand.js";
import { runUnlinkCommand } from "./runUnlinkCommand.js";
import { runUpdateCommand } from "./runUpdateCommand.js";
import { clipstitchrCliDescription } from "../config/clipstitchrCliDescription.js";
import { readCliPackageVersion } from "../config/readCliPackageVersion.js";
import { runInteractiveCommand } from "../interactive/runInteractiveCommand.js";

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

  const demo = program.command("demo").description("Make or upload demos");

  demo
    .command("auto")
    .description("Let AI write and record a demo")
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
    .description("Run the guarded demo agent");

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
    .command("run")
    .description("Run a guarded demo agent")
    .requiredOption("--guide <name-id-or-path>", "Use a saved walkthrough guide")
    .option("--ai-planner", "Ask ClipStitchr AI to propose each guarded action")
    .option(
      "--driver <driver>",
      "Use structured-planner or openai-computer for browser control",
    )
    .option("--dry-run", "Validate the run without recording or uploading")
    .option("--openai-mode <mode>", "Use direct or relay for OpenAI Computer Use")
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
    .command("export-log")
    .argument("<runId>", "Agent run ID")
    .description("Show or export local agent evidence paths")
    .option("--output <path>", "Write one JSON export file")
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
    .command("generate")
    .description("Create an AI walkthrough guide")
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
    .command("export-instructions")
    .argument("<guide>", "Guide name, ID, or guide file path")
    .description("Export local-agent instructions for a guide")
    .option("--output <path>", "Write instructions to this Markdown file")
    .action(async (guide, options) => {
      await runDemoGuideExportInstructionsCommand(guide, {
        ...program.opts(),
        ...options,
      });
    });

  demo
    .command("make")
    .description("Record a new product demo")
    .option("--guide <name-id-or-path>", "Use a saved walkthrough guide")
    .option("--no-guide", "Record without a walkthrough guide")
    .option("--no-upload", "Record only")
    .option("--output <path>", "Save the MP4 here")
    .option("--product <id>", "Use this product ID")
    .option("--start <command>", "Start command")
    .option("--url <url>", "Local app URL")
    .action(async (options) => {
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
  const nativeHelper = native
    .command("helper")
    .description("Build and check the macOS window helper");

  nativeHelper
    .command("build")
    .description("Build the macOS window helper")
    .action(runNativeHelperBuildCommand);

  nativeHelper
    .command("install")
    .description("Build the macOS window helper for local use")
    .action(runNativeHelperInstallCommand);

  nativeHelper
    .command("check")
    .description("Check macOS helper permissions")
    .action(runNativeHelperCheckCommand);

  const stitchr = program.command("stitchr").description("Create Stitch drafts");

  stitchr
    .command("batch")
    .description("Start a Stitchr batch")
    .option("--product <id>", "Use this product ID")
    .option("--sound <id>", "Use a saved sound ID")
    .option("--template <id>", "Use a saved Stitch template ID")
    .option("--time-zone <name>", "Use this time zone for today's batch")
    .action(async (options) => {
      await runStitchrBatchCommand({ ...program.opts(), ...options });
    });

  const swipr = program.command("swipr").description("Create Swipe drafts");

  swipr
    .command("batch")
    .description("Queue Swipr batch drafts")
    .option("--product <id>", "Use this product ID")
    .action(async (options) => {
      await runSwiprBatchCommand({ ...program.opts(), ...options });
    });

  const library = program.command("library").description("List saved assets");

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

  const queue = program.command("queue").description("Add content to your queue");

  queue
    .command("stitch")
    .argument("[stitchId]", "Finished Stitch ID")
    .description("Add a finished Stitch to your Post Bridge queue")
    .option("--accounts <ids>", "Comma-separated Post Bridge account IDs")
    .option("--caption <text>", "Post caption")
    .option("--title <text>", "Post title")
    .action(async (stitchId, options) => {
      await runQueueStitchCommand(stitchId, { ...program.opts(), ...options });
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
