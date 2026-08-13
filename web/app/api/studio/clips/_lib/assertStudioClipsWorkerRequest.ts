import { timingSafeEqual } from "node:crypto";

export function assertStudioClipsWorkerRequest(request: Request) {
  const supplied = request.headers.get("x-studio-clips-worker-secret") ?? "";
  const expected = process.env.STUDIO_CLIPS_WORKER_SECRET ?? "";
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  if (
    expectedBytes.length < 32 ||
    suppliedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(suppliedBytes, expectedBytes)
  ) {
    throw new Error("Unauthorized Studio Clips worker request.");
  }
  return supplied;
}
