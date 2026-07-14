export function logEmailConfirmationDevelopmentStage(
  stage:
    | "confirmed"
    | "csrf-rejected"
    | "origin-rejected"
    | "provider-unavailable"
    | "reference-rejected"
    | "request-rejected"
    | "server-error",
) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[email-confirmation] ${stage}`);
  }
}
