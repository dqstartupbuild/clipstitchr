export function isPublicHttpsPublishingMediaUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const ipv4Parts = hostname.split(".").map(Number);
    const isIpv4 =
      ipv4Parts.length === 4 &&
      ipv4Parts.every(
        (part) => Number.isInteger(part) && part >= 0 && part <= 255,
      );
    const isPrivateIpv4 =
      isIpv4 &&
      (ipv4Parts[0] === 0 ||
        ipv4Parts[0] === 10 ||
        ipv4Parts[0] === 127 ||
        (ipv4Parts[0] === 169 && ipv4Parts[1] === 254) ||
        (ipv4Parts[0] === 172 && ipv4Parts[1] >= 16 && ipv4Parts[1] <= 31) ||
        (ipv4Parts[0] === 192 && ipv4Parts[1] === 168));

    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.hash &&
      Boolean(hostname) &&
      hostname !== "localhost" &&
      !hostname.includes(":") &&
      hostname !== "metadata.google.internal" &&
      !hostname.endsWith(".localhost") &&
      !hostname.endsWith(".internal") &&
      !hostname.endsWith(".local") &&
      !isPrivateIpv4
    );
  } catch {
    return false;
  }
}
