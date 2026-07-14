import type { Doc } from "../_generated/dataModel";

export function getEmailDependencyRetryAt(
  dependency: Doc<"emailProviderOperations">,
  now: number,
) {
  const dependencyReadyAt = Math.max(
    dependency.nextAttemptAt,
    dependency.leaseExpiresAt ?? 0,
  );

  return Math.max(now + 5_000, dependencyReadyAt + 1_000);
}
