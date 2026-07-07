export type DemoAgentRecordingUploadReviewResult = {
  approvedForUpload: boolean;
  skippedReason?: "approval-declined" | "incomplete-run" | "upload-disabled";
  uploaded: boolean;
};
