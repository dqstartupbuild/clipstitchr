import type { PrismaClient } from "@prisma/client";

import type { ProviderTokenKeyring } from "../tokens/ProviderTokenKeyring.js";

export type PrismaPublishingApiStoreOptions = Readonly<{
  database: PrismaClient;
  keyring: ProviderTokenKeyring;
}>;
