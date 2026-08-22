import { createPublicApiErrorResponse } from "@/lib/clipstitchr/publicApi/createPublicApiErrorResponse";

export function GET() {
  return Response.json({ name: "ClipStitchr API", publicApi: "/api/v1", openapi: "/openapi.json" });
}

function methodNotAllowed() {
  const response = createPublicApiErrorResponse({
    code: "method_not_allowed",
    message: "This API index is read-only.",
    resolution: "Use GET, then follow the publicApi or openapi link.",
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
