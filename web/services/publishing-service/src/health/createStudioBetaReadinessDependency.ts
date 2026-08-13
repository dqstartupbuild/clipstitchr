import type { ReadinessDependency } from "./ReadinessDependency.js";

export const createStudioBetaReadinessDependency = (
  enabled: boolean,
): ReadinessDependency =>
  Object.freeze({
    name: "studio-beta",
    check: async () => {
      if (!enabled) {
        throw new Error("Studio Beta is disabled.");
      }
    },
  });
