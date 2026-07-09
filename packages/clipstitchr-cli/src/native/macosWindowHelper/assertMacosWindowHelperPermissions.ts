import { createMacosWindowPermissionInstructions } from "./createMacosWindowPermissionInstructions.js";
import type { MacosWindowPermissionStatus } from "./MacosWindowPermissionStatus.js";

export function assertMacosWindowHelperPermissions(
  status: MacosWindowPermissionStatus,
) {
  if (status.accessibility && status.screenRecording) {
    return;
  }

  const missing = [
    status.screenRecording ? "" : "Screen Recording",
    status.accessibility ? "" : "Accessibility",
  ].filter(Boolean);

  throw new Error(
    [
      `Missing macOS permission: ${missing.join(", ")}.`,
      createMacosWindowPermissionInstructions(),
    ].join("\n\n"),
  );
}
