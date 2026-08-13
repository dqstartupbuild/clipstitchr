import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { assertStudioClipsWorkerRequest } from "./assertStudioClipsWorkerRequest";

export function getStudioClipsWorkerClient(request: Request) {
  return {
    convex: createConvexHttpClient(),
    secret: assertStudioClipsWorkerRequest(request),
  };
}
