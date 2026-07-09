import type { ClipstitchrCredentials } from "./ClipstitchrCredentials.js";

export function getClipstitchrCredentialsAreUsable(input: {
  apiBaseUrl: string;
  credentials?: ClipstitchrCredentials | null;
}) {
  return Boolean(
    input.credentials &&
      input.credentials.apiBaseUrl === input.apiBaseUrl &&
      new Date(input.credentials.expiresAt).getTime() > Date.now(),
  );
}
