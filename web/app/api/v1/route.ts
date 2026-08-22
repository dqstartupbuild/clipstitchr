import { createPublicApiErrorResponse } from "@/lib/clipstitchr/publicApi/createPublicApiErrorResponse";

export function GET() {
  return Response.json({
    name: "ClipStitchr Public API",
    version: "v1",
    openapi: "/openapi.json",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/hooks",
        description: "Generate eight deterministic app-ad hooks.",
      },
    ],
    authentication: "No authentication is required for public endpoints.",
    errors: { shape: { error: { code: "string", message: "string", resolution: "string" } } },
  }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}

function methodNotAllowed() {
  const response = createPublicApiErrorResponse({
    code: "method_not_allowed",
    message: "This API index is read-only.",
    resolution: "Use GET to discover the public API.",
    status: 405,
  });
  response.headers.set("Allow", "GET");
  return response;
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const OPTIONS = methodNotAllowed;
