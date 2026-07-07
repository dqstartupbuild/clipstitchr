import { resolve } from "node:path";
import type { DemoAgentPolicy } from "../../src/demoAgent/DemoAgentPolicy.js";

export function createDemoAgentTestPolicy(
  overrides: Partial<DemoAgentPolicy> = {},
): DemoAgentPolicy {
  return {
    allowFileUploads: true,
    allowedOrigins: ["http://localhost:3000"],
    allowedRoutes: ["/", "/dashboard", "/upload"],
    approvedTestValues: {
      testEmail: "demo@example.com",
    },
    approvedUploadFiles: [resolve(process.cwd(), "fixtures/demo-sample.mp4")],
    blockedTextPatterns: [
      "delete",
      "billing",
      "payment",
      "publish",
      "password",
      "api key",
    ],
    maxActions: 80,
    maxRecordingSeconds: 180,
    requiresApprovalBeforeUpload: true,
    stuckStateLimit: 3,
    version: 1,
    ...overrides,
  };
}
