import type { InstagramContainerStatus } from "./fetchInstagramContainerStatus";
import { fetchInstagramContainerStatus } from "./fetchInstagramContainerStatus";

export async function waitForInstagramContainer(
  containerId: string,
  accessToken: string,
) {
  let status: InstagramContainerStatus | undefined;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    status = await fetchInstagramContainerStatus(containerId, accessToken);

    if (
      status.status_code === "FINISHED" ||
      status.status_code === "ERROR" ||
      status.status_code === "EXPIRED"
    ) {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }

  return status;
}
