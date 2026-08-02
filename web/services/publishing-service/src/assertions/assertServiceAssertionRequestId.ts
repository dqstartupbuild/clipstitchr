import { InvalidServiceAssertionError } from "../errors/InvalidServiceAssertionError.js";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

export const assertServiceAssertionRequestId = (requestId: string): void => {
  if (!REQUEST_ID_PATTERN.test(requestId)) {
    throw new InvalidServiceAssertionError("claims");
  }
};
