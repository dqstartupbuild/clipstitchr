import { InvalidServiceAssertionError } from "../errors/InvalidServiceAssertionError.js";

export const assertServiceAssertionIdentifier = (value: string): void => {
  if (
    value.length < 1 ||
    value.length > 256 ||
    /[\u0000-\u001f\u007f\s]/.test(value)
  ) {
    throw new InvalidServiceAssertionError("claims");
  }
};
