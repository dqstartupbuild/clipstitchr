import { createPublicApiErrorResponse } from "@/lib/clipstitchr/publicApi/createPublicApiErrorResponse";

function notFound() {
  return createPublicApiErrorResponse({ code: "not_found", message: "This API endpoint does not exist.", resolution: "Read /api/v1 or /openapi.json for public endpoints.", status: 404 });
}

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
export const OPTIONS = notFound;
