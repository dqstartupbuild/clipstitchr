const sensitiveAssignmentPattern =
  /\b(api[_-]?key|authorization|cookie|password|secret|signature|token)\s*[:=]\s*([^\s,;]+)/gi;
const bearerPattern = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const awsAccessKeyPattern = /\b(?:A3T|AKIA|ASIA)[A-Z0-9]{16}\b/g;
const googleApiKeyPattern = /\bAIza[A-Za-z0-9_-]{30,}\b/g;
const signedUrlPattern = /https?:\/\/[^\s<>"']+/gi;
const sensitiveQueryNames = new Set([
  "access_token",
  "credential",
  "expires",
  "key-pair-id",
  "policy",
  "signature",
  "sig",
  "token",
]);

export function redactStudioClipsSensitiveText(value: string): string {
  const redactedUrls = value.replace(signedUrlPattern, (candidate) => {
    const trailingMatch = candidate.match(/[),.;!?]+$/);
    const trailing = trailingMatch?.[0] ?? "";
    const rawUrl = trailing ? candidate.slice(0, -trailing.length) : candidate;

    try {
      const url = new URL(rawUrl);
      const hasSignedQuery = [...url.searchParams.keys()].some((key) => {
        const normalized = key.toLowerCase();

        return (
          normalized.startsWith("x-amz-") ||
          normalized.startsWith("x-goog-") ||
          sensitiveQueryNames.has(normalized)
        );
      });

      if (!hasSignedQuery) {
        return candidate;
      }

      return `${url.origin}${url.pathname}?[REDACTED_SIGNED_QUERY]${trailing}`;
    } catch {
      return candidate;
    }
  });

  return redactedUrls
    .replace(bearerPattern, "Bearer [REDACTED]")
    .replace(sensitiveAssignmentPattern, "$1=[REDACTED]")
    .replace(awsAccessKeyPattern, "[REDACTED_AWS_KEY]")
    .replace(googleApiKeyPattern, "[REDACTED_GOOGLE_KEY]");
}
