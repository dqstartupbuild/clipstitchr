import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { defaultDemoAgentBlockedTextPatterns } from "./defaultDemoAgentBlockedTextPatterns.js";

export function createNativeDemoAgentPolicy(): DemoAgentPolicy {
  return {
    allowFileUploads: false,
    allowedOrigins: ["macos-window://local"],
    allowedRoutes: ["/"],
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
