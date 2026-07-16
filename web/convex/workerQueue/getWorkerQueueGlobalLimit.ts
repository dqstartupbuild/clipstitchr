export function getWorkerQueueGlobalLimit(worker: "provider" | "media") {
  const name =
    worker === "provider"
      ? "PROVIDER_GLOBAL_ACTIVE_GENERATION_LIMIT"
      : "MEDIA_GLOBAL_ACTIVE_GENERATION_LIMIT";
  const value = Number.parseInt(process.env[name] ?? "50", 10);

  return Number.isFinite(value) && value > 0 ? value : 50;
}
