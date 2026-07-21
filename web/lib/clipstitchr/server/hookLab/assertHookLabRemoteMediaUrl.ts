import { lookup } from "node:dns/promises";
import { getHookLabIpAddressIsPublic } from "@/lib/clipstitchr/server/hookLab/getHookLabIpAddressIsPublic";

type ResolveHookLabHostname = (
  hostname: string,
) => Promise<readonly { address: string; family: number }[]>;

export async function assertHookLabRemoteMediaUrl(
  input: string,
  resolveHostname: ResolveHookLabHostname = (hostname) =>
    lookup(hostname, { all: true, verbatim: true }),
  mediaLabel = "video",
) {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    throw new Error(`The imported ${mediaLabel} URL is invalid.`);
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443")
  ) {
    throw new Error(`The imported ${mediaLabel} must use a secure public URL.`);
  }

  const hostname = url.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "");

  if (
    !hostname ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname === "metadata" ||
    hostname === "metadata.google.internal" ||
    hostname.endsWith(".internal") ||
    hostname === "instance-data"
  ) {
    throw new Error(`The imported ${mediaLabel} must use a public host.`);
  }

  const literalIpVersion = hostname.includes(":")
    ? 6
    : /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
      ? 4
      : 0;
  const addresses = literalIpVersion
    ? [{ address: hostname, family: literalIpVersion }]
    : await resolveHostname(hostname).catch(() => []);

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !getHookLabIpAddressIsPublic(address))
  ) {
    throw new Error(`The imported ${mediaLabel} must resolve to a public host.`);
  }

  return url;
}
