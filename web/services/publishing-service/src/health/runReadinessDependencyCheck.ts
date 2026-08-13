import type { ReadinessCheckResult } from "./ReadinessCheckResult.js";
import type { ReadinessDependency } from "./ReadinessDependency.js";

export const runReadinessDependencyCheck = async (
  dependency: ReadinessDependency,
  timeoutMilliseconds: number,
): Promise<ReadinessCheckResult> => {
  let timeout: NodeJS.Timeout | undefined;

  try {
    await Promise.race([
      dependency.check(),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Readiness dependency timed out.")),
          timeoutMilliseconds,
        );
        timeout.unref();
      }),
    ]);

    return Object.freeze({ name: dependency.name, status: "ready" as const });
  } catch {
    return Object.freeze({ name: dependency.name, status: "not_ready" as const });
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
};
