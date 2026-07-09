import type { ScannedFlow } from "../project/ScannedFlow.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { defaultDemoAgentBlockedTextPatterns } from "./defaultDemoAgentBlockedTextPatterns.js";

export function createDemoAgentPolicy(input: {
  allowLiveOrigins?: boolean;
  allowedOrigin: string;
  flows: ScannedFlow[];
}): DemoAgentPolicy {
  return {
    allowFileUploads: false,
    allowLiveOrigins: input.allowLiveOrigins ? true : undefined,
    allowedOrigins: [input.allowedOrigin],
    allowedRoutes: Array.from(
      new Set([
        "/",
        ...input.flows
          .map((flow) => flow.path)
          .filter((path): path is string => Boolean(path)),
      ]),
    ).slice(0, 25),
    approvedTestValues: {},
    approvedUploadFiles: [],
    blockedTextPatterns: defaultDemoAgentBlockedTextPatterns,
    maxActions: 80,
    maxRecordingSeconds: 180,
    requiresApprovalBeforeUpload: true,
    stuckStateLimit: 3,
    version: 1,
  };
}
