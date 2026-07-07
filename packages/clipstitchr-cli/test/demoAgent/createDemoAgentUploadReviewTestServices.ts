import type { ClipstitchrCredentials } from "../../src/config/ClipstitchrCredentials.js";
import type { DemoAgentRunSummary } from "../../src/demoAgent/DemoAgentRunSummary.js";
import type { DemoAgentRecordingUploadReviewServices } from "../../src/commands/DemoAgentRecordingUploadReviewServices.js";

export function createDemoAgentUploadReviewTestServices(input: {
  approvedForUpload: boolean;
  productId?: string;
}) {
  const credentials: ClipstitchrCredentials = {
    accessToken: "token",
    apiBaseUrl: "https://example.test",
    expiresAt: "2027-01-01T00:00:00.000Z",
    savedAt: "2026-01-01T00:00:00.000Z",
    sessionId: "session",
  };
  const state: {
    confirmationCount: number;
    ensuredCredentialsCount: number;
    logs: string[];
    summaries: DemoAgentRunSummary[];
    uploadInputs: Parameters<
      DemoAgentRecordingUploadReviewServices["uploadDemoFile"]
    >[1][];
  } = {
    confirmationCount: 0,
    ensuredCredentialsCount: 0,
    logs: [],
    summaries: [],
    uploadInputs: [],
  };
  const services: DemoAgentRecordingUploadReviewServices = {
    confirmUpload: async () => {
      state.confirmationCount += 1;
      return input.approvedForUpload;
    },
    ensureCredentialsOrLogin: async () => {
      state.ensuredCredentialsCount += 1;
      return credentials;
    },
    logInfo: (message) => state.logs.push(message),
    logNextCommand: (command) => state.logs.push(command),
    logStep: (message) => state.logs.push(message),
    logSuccess: (message) => state.logs.push(message),
    logWarning: (message) => state.logs.push(message),
    selectProduct: async () => ({
      id: input.productId ?? "product_fixture",
      name: "Fixture product",
    }),
    uploadDemoFile: async (_credentials, uploadInput) => {
      state.uploadInputs.push(uploadInput);
      return { clipId: "clip_fixture" };
    },
    writeRunSummary: async (_runSummaryPath, summary) => {
      state.summaries.push(summary);
    },
  };

  return {
    credentials,
    services,
    state,
  };
}
