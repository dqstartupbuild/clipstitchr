export function getDemoAgentOriginIsHttp(origin: string) {
  try {
    const url = new URL(origin);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
