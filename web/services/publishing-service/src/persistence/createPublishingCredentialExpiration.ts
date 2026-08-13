import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

const MAXIMUM_CREDENTIAL_LIFETIME_SECONDS = 315_576_000;

export const createPublishingCredentialExpiration = (
  connectedAt: Date,
  lifetimeSeconds: number | undefined,
  field: string,
): Date | null => {
  if (lifetimeSeconds === undefined) {
    return null;
  }

  if (
    !Number.isSafeInteger(connectedAt.getTime()) ||
    !Number.isSafeInteger(lifetimeSeconds) ||
    lifetimeSeconds < 1 ||
    lifetimeSeconds > MAXIMUM_CREDENTIAL_LIFETIME_SECONDS
  ) {
    throw new PublishingPersistenceValidationError(field);
  }

  const expiresAt = new Date(connectedAt.getTime() + lifetimeSeconds * 1_000);

  if (!Number.isSafeInteger(expiresAt.getTime())) {
    throw new PublishingPersistenceValidationError(field);
  }

  return expiresAt;
};
