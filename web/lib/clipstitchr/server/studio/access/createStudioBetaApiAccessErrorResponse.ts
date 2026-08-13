import { StudioBetaApiAccessError } from "./StudioBetaApiAccessError";

export function createStudioBetaApiAccessErrorResponse(error: unknown) {
  if (!(error instanceof StudioBetaApiAccessError)) {
    return null;
  }

  return Response.json(
    { error: error.message },
    {
      headers: { "Cache-Control": "private, no-store" },
      status: error.status,
    },
  );
}
