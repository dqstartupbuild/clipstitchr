export function assertStudioLazyReelJsonValueIsSafe(
  value: unknown,
  label: string,
) {
  const pending: Array<{ depth: number; value: unknown }> = [
    { depth: 0, value },
  ];
  let visitedNodeCount = 0;

  while (pending.length > 0) {
    const current = pending.pop();

    if (!current) {
      break;
    }

    visitedNodeCount += 1;

    if (visitedNodeCount > 10_000) {
      throw new Error(`${label} has too many values.`);
    }

    if (current.depth > 32) {
      throw new Error(`${label} is nested too deeply.`);
    }

    if (current.value === null || typeof current.value === "boolean") {
      continue;
    }

    if (typeof current.value === "number") {
      if (!Number.isFinite(current.value)) {
        throw new Error(`${label} contains a non-finite number.`);
      }

      continue;
    }

    if (typeof current.value === "string") {
      if (current.value.length > 131_072) {
        throw new Error(`${label} contains an oversized string.`);
      }

      if (
        /(?:bearer\s+[a-z0-9._~-]{12,}|[?&](?:x-amz-signature|x-goog-signature|signature|sig|access_token|refresh_token|token)=)/i.test(
          current.value,
        )
      ) {
        throw new Error(`${label} cannot contain credentials or signed URLs.`);
      }

      continue;
    }

    if (Array.isArray(current.value)) {
      if (current.value.length > 2_000) {
        throw new Error(`${label} contains an oversized array.`);
      }

      for (const entry of current.value) {
        pending.push({ depth: current.depth + 1, value: entry });
      }

      continue;
    }

    if (typeof current.value !== "object") {
      throw new Error(`${label} contains a value that is not JSON-safe.`);
    }

    const entries = Object.entries(current.value);

    if (entries.length > 1_000) {
      throw new Error(`${label} contains an oversized object.`);
    }

    for (const [key, entry] of entries) {
      if (key.length > 128) {
        throw new Error(`${label} contains an oversized object key.`);
      }

      const normalizedKey = key
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .toLowerCase();

      if (
        /^(?:authorization|password|secret|api_key|access_key|access_token|refresh_token|auth_token|signed_url)$/.test(
          normalizedKey,
        )
      ) {
        throw new Error(`${label} cannot contain credential fields.`);
      }

      pending.push({ depth: current.depth + 1, value: entry });
    }
  }
}
