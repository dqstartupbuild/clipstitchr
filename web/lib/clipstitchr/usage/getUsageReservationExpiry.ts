export function getUsageReservationExpiry(
  createdAt: string,
  kind: "browser" | "worker",
) {
  const createdAtMs = Date.parse(createdAt);

  if (!Number.isFinite(createdAtMs)) {
    throw new Error("Usage reservation time is invalid.");
  }

  const durationMs = kind === "browser" ? 2 * 60 * 60 * 1_000 : 24 * 60 * 60 * 1_000;

  return new Date(createdAtMs + durationMs).toISOString();
}
