export async function readLazyReelClientResponseError(response: Response) {
  const body = (await response.json().catch(() => null)) as unknown;

  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }

  if (response.status === 429) {
    return "Research is busy right now. Give it a moment, then try again.";
  }

  return "The research job could not finish. Try it again.";
}
