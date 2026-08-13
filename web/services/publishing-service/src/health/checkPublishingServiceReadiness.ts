import type { PublishingServiceReadinessReport } from "./PublishingServiceReadinessReport.js";
import type { ReadinessDependency } from "./ReadinessDependency.js";
import { runReadinessDependencyCheck } from "./runReadinessDependencyCheck.js";

const DEPENDENCY_NAME_PATTERN = /^[a-z][a-z0-9-]{1,63}$/;

export const checkPublishingServiceReadiness = async (
  dependencies: readonly ReadinessDependency[],
  timeoutMilliseconds = 2_000,
): Promise<PublishingServiceReadinessReport> => {
  if (
    !Number.isSafeInteger(timeoutMilliseconds) ||
    timeoutMilliseconds < 1 ||
    timeoutMilliseconds > 30_000
  ) {
    throw new RangeError("Readiness timeout is invalid.");
  }

  const dependencyNames = dependencies.map(({ name }) => name);

  if (
    dependencyNames.some((name) => !DEPENDENCY_NAME_PATTERN.test(name)) ||
    new Set(dependencyNames).size !== dependencyNames.length
  ) {
    throw new TypeError("Readiness dependencies are invalid.");
  }

  const checks = Object.freeze(
    await Promise.all(
      dependencies.map((dependency) =>
        runReadinessDependencyCheck(dependency, timeoutMilliseconds),
      ),
    ),
  );
  const status =
    checks.length > 0 && checks.every((check) => check.status === "ready")
      ? "ready"
      : "not_ready";

  return Object.freeze({
    service: "clipstitchr-publishing-service",
    status,
    checks,
  });
};
