const sensitiveSocialDiagnosticKeyPattern =
  /(?:^|_)(?:access_?token|refresh_?token|client_?secret|api_?key|authorization|cookie|set_?cookie|password|secret|signature|signed_?url|fetch_?url|media_?url|token)(?:$|_)/i;

export function redactSocialDiagnosticValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSocialDiagnosticValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sensitiveSocialDiagnosticKeyPattern.test(key)
          ? "[REDACTED]"
          : redactSocialDiagnosticValue(nestedValue),
      ]),
    );
  }

  return value;
}
