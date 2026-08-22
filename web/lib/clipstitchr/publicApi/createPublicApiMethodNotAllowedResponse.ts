import { createPublicApiErrorResponse } from "@/lib/clipstitchr/publicApi/createPublicApiErrorResponse";

export function createPublicApiMethodNotAllowedResponse() {
  const response = createPublicApiErrorResponse({
    code: "method_not_allowed",
    message: "This method is not available for this endpoint.",
    resolution: "Use the method documented in /openapi.json.",
    status: 405,
  });

  response.headers.set("Allow", "POST");

  return response;
}
