export async function readStudioStitchJsonResponse<T>(response: Response) {
  const body = (await response.json().catch(() => null)) as
    | { error?: unknown }
    | T
    | null;
  if (!response.ok) {
    const error = body && typeof body === "object" && "error" in body
      ? body.error
      : null;
    throw new Error(
      typeof error === "string" && error.trim()
        ? error
        : `Studio Stitch could not finish that request (${response.status}).`,
    );
  }
  if (body === null) {
    throw new Error("Studio Stitch returned an empty response.");
  }

  return body as T;
}
