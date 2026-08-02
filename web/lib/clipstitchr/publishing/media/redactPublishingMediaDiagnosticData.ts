const redactedSignedUrl = "[REDACTED_SIGNED_URL]";

export function redactPublishingMediaDiagnosticData(
  value: unknown,
  seen = new WeakSet<object>(),
): unknown {
  if (typeof value === "string") {
    return value.replace(/https:\/\/[^\s"'<>]+/gi, (candidate) => {
      try {
        const url = new URL(candidate);
        const sensitiveParameters = [
          "x-amz-signature",
          "x-amz-credential",
          "x-amz-security-token",
          "signature",
          "sig",
          "token",
        ];

        return sensitiveParameters.some((parameter) =>
          Array.from(url.searchParams.keys()).some(
            (key) => key.toLowerCase() === parameter,
          ),
        )
          ? redactedSignedUrl
          : candidate;
      } catch {
        return candidate;
      }
    });
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[CIRCULAR]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactPublishingMediaDiagnosticData(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "");

      if (
        typeof item === "string" &&
        (normalizedKey.includes("signedurl") ||
          normalizedKey === "downloadurl" ||
          normalizedKey === "uploadurl")
      ) {
        return [key, redactedSignedUrl];
      }

      return [key, redactPublishingMediaDiagnosticData(item, seen)];
    }),
  );
}
