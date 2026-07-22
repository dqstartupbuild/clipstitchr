export function getUsageReservationExpiry(
  createdAt: string,
  kind: "browser" | "server" | "worker",
) {
  const createdAtMs = Date.parse(createdAt);

  if (!Number.isFinite(createdAtMs)) {
    throw new Error("Usage reservation time is invalid.");
  }

  const durationMs =
    kind === "worker" ? 24 * 60 * 60 * 1_000 : 2 * 60 * 60 * 1_000;

  return new Date(createdAtMs + durationMs).toISOString();
}
