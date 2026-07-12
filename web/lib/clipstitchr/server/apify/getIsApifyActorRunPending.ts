import type { ApifyActorRun } from "@/lib/clipstitchr/types/ApifyActorRun";

export function getIsApifyActorRunPending(status: ApifyActorRun["status"]) {
  return (
    status === "READY" ||
    status === "RUNNING" ||
    status === "TIMING-OUT" ||
    status === "ABORTING"
  );
}
