import type { KeyObject } from "node:crypto";

declare const serviceAssertionSigningKeyBrand: unique symbol;

export type ServiceAssertionSigningKey = KeyObject & {
  readonly [serviceAssertionSigningKeyBrand]: "service-assertion-signing-key";
};
