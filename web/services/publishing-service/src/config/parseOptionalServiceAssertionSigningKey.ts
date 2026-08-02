import type { ServiceAssertionSigningKey } from "../assertions/ServiceAssertionSigningKey.js";
import { createServiceAssertionSigningKey } from "../assertions/createServiceAssertionSigningKey.js";

export const parseOptionalServiceAssertionSigningKey = (
  encodedKey: string | undefined,
): ServiceAssertionSigningKey | undefined =>
  encodedKey === undefined
    ? undefined
    : createServiceAssertionSigningKey(encodedKey);
