export function isPublishingMediaR2UnavailableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    $metadata?: { httpStatusCode?: number };
    name?: string;
  };

  return (
    candidate.$metadata?.httpStatusCode === 404 ||
    candidate.$metadata?.httpStatusCode === 412 ||
    candidate.name === "NoSuchKey" ||
    candidate.name === "PreconditionFailed"
  );
}
