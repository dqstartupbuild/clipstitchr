export function getStudioReelCoordinatorPublicMessage(status: number) {
  if (status === 401 || status === 403) {
    return "Studio Stitch coordinator authentication failed.";
  }
  if (status === 404) {
    return "The Studio Stitch coordinator record was not found.";
  }
  if (status === 409) {
    return "Studio Stitch coordinator state changed. Claim the run again.";
  }
  if (status === 429) {
    return "The Studio Stitch coordinator rate limit was reached.";
  }
  if (status >= 500) {
    return "The Studio Stitch coordinator is temporarily unavailable.";
  }
  return "The Studio Stitch coordinator rejected the request.";
}
