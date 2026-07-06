import { Command } from "commander";
import { runDoctorCommand } from "./runDoctorCommand.js";
import { runDemoMakeCommand } from "./runDemoMakeCommand.js";
import { runDemoUploadCommand } from "./runDemoUploadCommand.js";
import { runHelpCommand } from "./runHelpCommand.js";
import { runInitCommand } from "./runInitCommand.js";
import { runLoginCommand } from "./runLoginCommand.js";
import { runLogoutCommand } from "./runLogoutCommand.js";
import { runProductsCreateCommand } from "./runProductsCreateCommand.js";
import { runProductsListCommand } from "./runProductsListCommand.js";
import { runProductsUseCommand } from "./runProductsUseCommand.js";
import { runScanCommand } from "./runScanCommand.js";
import { runStatusCommand } from "./runStatusCommand.js";
import { runUnlinkCommand } from "./runUnlinkCommand.js";
import { runUpdateCommand } from "./runUpdateCommand.js";
import { readCliPackageVersion } from "../config/readCliPackageVersion.js";
import { runInteractiveCommand } from "../interactive/runInteractiveCommand.js";

export async function runCli(argv: string[]) {
  const packageVersion = await readCliPackageVersion();
  const program = new Command();

  program
    .name("clipstitchr")
    .description("Record and upload product demos to ClipStitchr.")
    .option("--api <url>", "Use a ClipStitchr app URL")
    .version(packageVersion);

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
    .command("make")
    .description("Record a new product demo")
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
