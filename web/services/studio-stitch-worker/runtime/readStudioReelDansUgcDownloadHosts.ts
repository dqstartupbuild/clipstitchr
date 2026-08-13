import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";

export function readStudioReelDansUgcDownloadHosts(value: string | undefined) {
  const hosts = [...new Set(
    (value ?? "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  )].sort();
  if (
    hosts.length > 20 ||
    hosts.some(
      (host) =>
        host.length > 253 ||
        !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u.test(
          host,
        ),
    )
  ) {
    throw new StudioReelWorkerError({
      code: "INVALID_DANSUGC_DOWNLOAD_HOSTS",
      kind: "permanent",
      publicMessage: "The DanSUGC download host allowlist is invalid.",
    });
  }
  return hosts;
}
