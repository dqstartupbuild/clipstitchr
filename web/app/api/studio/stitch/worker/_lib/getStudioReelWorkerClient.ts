import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { assertStudioReelWorkerRequest } from "./assertStudioReelWorkerRequest";

export function getStudioReelWorkerClient(request: Request) {
  return {
    convex: createConvexHttpClient(),
    secret: assertStudioReelWorkerRequest(request),
  };
}
