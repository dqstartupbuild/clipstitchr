import { timingSafeEqual } from "node:crypto";

export function assertStudioReelWorkerRequest(request: Request) {
  const supplied = request.headers.get("x-studio-stitch-worker-secret") ?? "";
  const expected = process.env.STUDIO_STITCH_WORKER_SECRET ?? "";
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  if (
    expectedBytes.length < 32 ||
    suppliedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(suppliedBytes, expectedBytes)
  ) {
    throw new Error("Unauthorized Studio Stitch worker request.");
  }
  return supplied;
}
