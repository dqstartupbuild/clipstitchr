import type { ProductSummary } from "../api/ProductSummary.js";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { writeDemoAgentRunSummary } from "../demoAgent/writeDemoAgentRunSummary.js";
import type { uploadDemoFile } from "../upload/uploadDemoFile.js";

export type DemoAgentRecordingUploadReviewServices = {
  confirmUpload: () => Promise<boolean>;
  ensureCredentialsOrLogin: (
    apiBaseUrl: string,
  ) => Promise<ClipstitchrCredentials>;
  logInfo: (message: string) => void;
  logNextCommand: (command: string) => void;
  logStep: (message: string) => void;
  logSuccess: (message: string) => void;
  logWarning: (message: string) => void;
  selectProduct: (
    credentials: ClipstitchrCredentials,
    preferredProductId?: string,
  ) => Promise<ProductSummary>;
  uploadDemoFile: typeof uploadDemoFile;
  writeRunSummary: typeof writeDemoAgentRunSummary;
};
