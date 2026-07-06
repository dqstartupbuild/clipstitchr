import { spawn } from "node:child_process";

export function openIosSimulatorApp() {
  const childProcess = spawn("open", ["-a", "Simulator"], {
    detached: true,
    stdio: "ignore",
  });

  childProcess.unref();
}
