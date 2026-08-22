import { createPublicApiMethodNotAllowedResponse } from "@/lib/clipstitchr/publicApi/createPublicApiMethodNotAllowedResponse";

export { POST } from "@/app/api/tools/app-hook-generator/route";

export const runtime = "nodejs";

export const GET = createPublicApiMethodNotAllowedResponse;
export const PUT = createPublicApiMethodNotAllowedResponse;
export const PATCH = createPublicApiMethodNotAllowedResponse;
export const DELETE = createPublicApiMethodNotAllowedResponse;
export const OPTIONS = createPublicApiMethodNotAllowedResponse;
