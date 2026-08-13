export function isStudioReelWorkerIdentifier(candidate: unknown) {
  return (
    typeof candidate === "string" &&
    candidate.length >= 1 &&
    candidate.length <= 240 &&
    /^[A-Za-z0-9._:@/-]+$/u.test(candidate)
  );
}
