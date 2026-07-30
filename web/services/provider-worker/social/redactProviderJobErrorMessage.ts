import { redactSocialDiagnosticString } from "@/lib/clipstitchr/server/social/redactSocialDiagnosticString";

export function redactProviderJobErrorMessage(
  jobType: string,
  message: string,
) {
  return jobType.startsWith("social-")
    ? redactSocialDiagnosticString(message)
    : message;
}
