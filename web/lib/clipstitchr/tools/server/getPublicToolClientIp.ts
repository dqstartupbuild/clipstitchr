import { isIP } from "node:net";

export function getPublicToolClientIp(request: Request) {
  const directCandidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
  ];

  for (const candidate of directCandidates) {
    const value = candidate?.trim() ?? "";

    if (isIP(value)) {
      return value;
    }
  }

  const forwardedCandidates = [
    ...(request.headers.get("x-forwarded-for")?.split(",") ?? []),
  ].reverse();

  for (const candidate of forwardedCandidates) {
    const value = candidate.trim();

    if (isIP(value)) {
      return value;
    }
  }

  return "unresolved";
}
