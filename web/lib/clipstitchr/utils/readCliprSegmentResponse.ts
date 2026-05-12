import type { CliprSegmentResponse } from "@/lib/clipstitchr/types/CliprSegmentResponse";

type CliprSegmentErrorResponse = {
  message?: string;
};

export async function readCliprSegmentResponse(response: Response) {
  const body = (await response.json()) as
    | CliprSegmentResponse
    | CliprSegmentErrorResponse;

  if (!response.ok) {
    throw new Error(
      "message" in body && body.message
        ? body.message
        : "Unable to create this Clipr segment.",
    );
  }

  return body as CliprSegmentResponse;
}
