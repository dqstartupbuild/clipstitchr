export type DemoAgentPolicy = {
  allowFileUploads: boolean;
  allowedOrigins: string[];
  allowedRoutes: string[];
  approvedTestValues: Record<string, string>;
  approvedUploadFiles: string[];
  blockedTextPatterns: string[];
  maxActions: number;
  maxRecordingSeconds: number;
  requiresApprovalBeforeUpload: boolean;
  stuckStateLimit: number;
  testAccountNotes?: string;
  version: 1;
};
