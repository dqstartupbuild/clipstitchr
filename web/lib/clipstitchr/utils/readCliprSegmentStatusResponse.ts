import type { CliprSegmentStatusResponse } from "@/lib/clipstitchr/types/CliprSegmentStatusResponse";

type CliprSegmentStatusErrorResponse = {
  message?: string;
};

async function readCliprSegmentStatusBody(response: Response) {
  try {
    return (await response.json()) as
      | CliprSegmentStatusResponse
      | CliprSegmentStatusErrorResponse;
  } catch {
    return {
      message: response.ok
        ? undefined
        : "Clipr generation ended before returning a usable status.",
    };
  }
}

export async function readCliprSegmentStatusResponse(response: Response) {
  const body = await readCliprSegmentStatusBody(response);

  if (!response.ok) {
    throw new Error(
      "message" in body && body.message
        ? body.message
        : "Unable to load this Clipr segment.",
    );
  }

  return body as CliprSegmentStatusResponse;
}
