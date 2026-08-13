const sensitiveAssignment =
  /\b(secret|token|authorization|api[-_ ]?key|credential|password)\b\s*[:=]\s*[^\s,;]+/gi;
const bearer = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const urlSecret = /([?&](?:key|token|secret|signature)=)[^&#\s]+/gi;

export function redactStudioReelWorkerText(value: string) {
  return value
    .replace(sensitiveAssignment, "$1=[redacted]")
    .replace(bearer, "Bearer [redacted]")
    .replace(urlSecret, "$1[redacted]");
}
