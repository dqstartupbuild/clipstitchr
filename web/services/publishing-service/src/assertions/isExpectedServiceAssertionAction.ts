import type { ServiceAssertionAction } from "./ServiceAssertionAction.js";

export const isExpectedServiceAssertionAction = (
  action: ServiceAssertionAction,
  expected: ServiceAssertionAction | readonly ServiceAssertionAction[],
): boolean =>
  Array.isArray(expected)
    ? (expected as readonly ServiceAssertionAction[]).includes(action)
    : action === expected;
