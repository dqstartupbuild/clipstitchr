import type {
  ClipPublishingProvider,
  ClipPublishingTokenKind,
} from "@prisma/client";

export type PublishingIntegrationSecretMetadata = Readonly<{
  id: string;
  providerIdentifier: ClipPublishingProvider;
  tokenKind: ClipPublishingTokenKind;
  version: number;
  expiresAt: Date | null;
  createdAt: Date;
  replacedAt: Date | null;
}>;
