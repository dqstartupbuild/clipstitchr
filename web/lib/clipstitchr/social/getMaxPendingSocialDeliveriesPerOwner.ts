export function getMaxPendingSocialDeliveriesPerOwner() {
  const configured = Number(
    process.env.SOCIAL_MAX_PENDING_DELIVERIES_PER_OWNER ?? "2000",
  );

  if (!Number.isInteger(configured) || configured < 1 || configured > 20_000) {
    throw new Error(
      "SOCIAL_MAX_PENDING_DELIVERIES_PER_OWNER must be between 1 and 20000.",
    );
  }

  return configured;
}
