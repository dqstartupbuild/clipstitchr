export type PublishingMediaCompatibilityIssue = {
  code: string;
  mediaIndex?: number;
  message: string;
  severity: "error" | "warning";
};
