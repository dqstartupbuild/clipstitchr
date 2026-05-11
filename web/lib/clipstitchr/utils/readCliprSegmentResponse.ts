import type { CliprSegmentResponse } from "@/lib/clipstitchr/types/CliprSegmentResponse";

type CliprSegmentErrorResponse = {
  message?: string;
};

async function readCliprSegmentBody(response: Response) {
  try {
    return (await response.json()) as
      | CliprSegmentResponse
      | CliprSegmentErrorResponse;
  } catch {
    return {
      message: response.ok
        ? undefined
        : "Clipr generation ended before returning a usable response.",
    };
  }
}

export async function readCliprSegmentResponse(response: Response) {
  const body = await readCliprSegmentBody(response);

  if (!response.ok) {
    throw new Error(
      "message" in body && body.message
        ? body.message
        : "Unable to create this Clipr segment.",
    );
  }

  return body as CliprSegmentResponse;
}
