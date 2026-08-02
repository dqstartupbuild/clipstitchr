import { InvalidServiceAssertionError } from "../errors/InvalidServiceAssertionError.js";
import { SERVICE_ASSERTION_HEADER } from "./serviceAssertionConstants.js";

export const parseServiceAssertionHeader = (value: unknown): void => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new InvalidServiceAssertionError("malformed");
  }

  const header = value as Record<string, unknown>;

  if (
    Object.keys(header).length !== 3 ||
    header["alg"] !== SERVICE_ASSERTION_HEADER.alg ||
    header["typ"] !== SERVICE_ASSERTION_HEADER.typ ||
    header["v"] !== SERVICE_ASSERTION_HEADER.v
  ) {
    throw new InvalidServiceAssertionError("malformed");
  }
};
