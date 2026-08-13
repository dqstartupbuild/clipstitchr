import { createHash } from "node:crypto";

import type { CanonicalJsonValue } from "./CanonicalJsonValue.js";
import { canonicalizeJsonValue } from "./canonicalizeJsonValue.js";

export const createCanonicalPublishingRequestHash = (
  value: CanonicalJsonValue,
): string =>
  createHash("sha256")
    .update(canonicalizeJsonValue(value), "utf8")
    .digest("hex");
