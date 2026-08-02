import type { PrismaClient } from "@prisma/client";

import type { ProviderTokenCipherKey } from "../tokens/ProviderTokenCipherKey.js";
import type { ProviderTokenKeyring } from "../tokens/ProviderTokenKeyring.js";

export type PrismaPublishingIntegrationConnectionStoreOptions = Readonly<{
  cipherKey: ProviderTokenCipherKey;
  database: PrismaClient;
  keyring: ProviderTokenKeyring;
}>;
