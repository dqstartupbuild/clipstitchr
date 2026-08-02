export type PublishingIntegrationRecord = Readonly<{
  id: string;
  internalId: string;
  name: string;
  picture: string | null;
  providerIdentifier: string;
  type: string;
  disabled: boolean;
  tokenExpiration: Date | null;
  profile: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  refreshNeeded: boolean;
}>;
