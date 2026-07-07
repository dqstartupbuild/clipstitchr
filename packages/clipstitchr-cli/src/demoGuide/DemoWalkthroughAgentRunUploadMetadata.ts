export type DemoWalkthroughAgentRunUploadMetadata = {
  actionCount?: number;
  actionLogObjectKey?: string;
  approvedForUpload?: boolean;
  id: string;
  mode: "guided-browser";
  screenshotCount?: number;
  stopReason?: string;
  uploaded?: boolean;
};
