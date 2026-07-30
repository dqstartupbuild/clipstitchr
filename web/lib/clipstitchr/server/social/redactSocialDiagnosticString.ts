import { redactSocialDiagnosticValue } from "./redactSocialDiagnosticValue";

const maxSocialDiagnosticLength = 20_000;

export function redactSocialDiagnosticString(value: string) {
  try {
    return JSON.stringify(redactSocialDiagnosticValue(JSON.parse(value))).slice(
      0,
      maxSocialDiagnosticLength,
    );
  } catch {
    return value
      .replace(
        /(Bearer\s+)[A-Za-z0-9._~+/=-]+/gi,
        "$1[REDACTED]",
      )
      .replace(
        /([?&](?:access_token|refresh_token|client_secret|api_key|token|signature|sig|key)=)[^&\s"']+/gi,
        "$1[REDACTED]",
      )
      .replace(
        /((?:access[ _-]?token|refresh[ _-]?token|client[ _-]?secret|api[ _-]?key|authorization|cookie|password|secret|signature|signed[ _-]?url|fetch[ _-]?url|media[ _-]?url|token)\s*[:=]\s*["']?)[^"',}\s]+/gi,
        "$1[REDACTED]",
      )
      .slice(0, maxSocialDiagnosticLength);
  }
}
