export function getStudioStitchRunStatusLabel(
  status: "blocked" | "intentReady" | "canceled" | "failed" | "completed",
  hasStarted = false,
) {
  if (status === "intentReady") {
    return hasStarted ? "Processing" : "Waiting for processing";
  }
  if (status === "blocked") return "Needs setup";
  if (status === "canceled") return "Canceled";
  if (status === "failed") return "Failed";
  return "Completed";
}
