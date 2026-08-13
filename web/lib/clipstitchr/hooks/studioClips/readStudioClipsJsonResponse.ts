export async function readStudioClipsJsonResponse<T>(
  response: Response,
): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | { error?: unknown }
    | T
    | null;

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? body.error
        : undefined;

    throw new Error(
      typeof message === "string" && message.trim()
        ? message
        : `Studio Clips could not finish that request (${response.status}).`,
    );
  }

  if (!body) {
    throw new Error("Studio Clips returned an empty response.");
  }

  return body as T;
}
