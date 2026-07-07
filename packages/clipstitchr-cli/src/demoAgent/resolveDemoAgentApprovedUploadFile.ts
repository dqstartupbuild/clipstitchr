import { basename, resolve } from "node:path";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";

export function resolveDemoAgentApprovedUploadFile(
  policy: DemoAgentPolicy,
  fileKey: string,
) {
  const resolvedFileKey = resolve(process.cwd(), fileKey);
  const matches = policy.approvedUploadFiles.filter(
    (filePath) =>
      filePath === resolvedFileKey ||
      filePath === fileKey ||
      basename(filePath) === fileKey,
  );

  if (matches.length !== 1) {
    throw new Error("The agent can only upload one explicitly approved file.");
  }

  return matches[0];
}
