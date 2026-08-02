import type { KeyObject } from "node:crypto";

export type ProviderTokenCipherKey = Readonly<{
  id: string;
  key: KeyObject;
  purpose: "provider-token-encryption";
}>;
