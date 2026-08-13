export type PublishingApiCompatibilityIssue = Readonly<{
  code: string;
  message: string;
  severity: "error" | "warning";
}>;
