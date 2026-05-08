export function sanitizeR2KeySegment(segment: string) {
  const sanitizedSegment = segment
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "");

  if (!sanitizedSegment) {
    throw new Error("R2 object key segment cannot be empty.");
  }

  return sanitizedSegment;
}
