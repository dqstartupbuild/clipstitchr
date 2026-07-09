import { runNativeHelperBuildCommand } from "./runNativeHelperBuildCommand.js";

export async function runNativeHelperInstallCommand() {
  await runNativeHelperBuildCommand();
}
