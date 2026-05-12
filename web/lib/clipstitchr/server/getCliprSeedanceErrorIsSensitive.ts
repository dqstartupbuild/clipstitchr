export function getCliprSeedanceErrorIsSensitive(error: unknown) {
  const message =
    typeof error === "string" ? error : error ? JSON.stringify(error) : "";

  return message.includes("E005") || message.includes("flagged as sensitive");
}
