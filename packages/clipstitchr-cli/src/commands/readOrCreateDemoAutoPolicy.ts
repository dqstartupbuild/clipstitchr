import type { DemoAgentPolicy } from "../demoAgent/DemoAgentPolicy.js";
import { createDemoAgentPolicy } from "../demoAgent/createDemoAgentPolicy.js";
import { readDemoAgentPolicy } from "../demoAgent/readDemoAgentPolicy.js";
import { writeDemoAgentPolicy } from "../demoAgent/writeDemoAgentPolicy.js";
import type { ScannedFlow } from "../project/ScannedFlow.js";

export async function readOrCreateDemoAutoPolicy(input: {
  allowLiveOrigins?: boolean;
  allowedOrigin: string;
  flows: ScannedFlow[];
  startPath?: string;
}): Promise<{
  hash: string;
  path: string;
  policy: DemoAgentPolicy;
}> {
  const startPath =
    input.startPath && input.startPath.startsWith("/")
      ? input.startPath
      : undefined;

  try {
    const savedPolicy = await readDemoAgentPolicy();
    const hasAllowedOrigin = savedPolicy.policy.allowedOrigins.includes(
      input.allowedOrigin,
    );
    const hasLiveAccess =
      !input.allowLiveOrigins || savedPolicy.policy.allowLiveOrigins === true;
    const hasStartPath =
      !startPath || savedPolicy.policy.allowedRoutes.includes(startPath);

    if (hasAllowedOrigin && hasLiveAccess && hasStartPath) {
      return savedPolicy;
    }

    if (hasAllowedOrigin) {
      await writeDemoAgentPolicy({
        ...savedPolicy.policy,
        allowLiveOrigins:
          input.allowLiveOrigins || savedPolicy.policy.allowLiveOrigins
            ? true
            : undefined,
        allowedRoutes:
          startPath && !savedPolicy.policy.allowedRoutes.includes(startPath)
            ? Array.from(
                new Set([...savedPolicy.policy.allowedRoutes, startPath]),
              )
            : savedPolicy.policy.allowedRoutes,
      });

      return await readDemoAgentPolicy();
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  const policy = createDemoAgentPolicy({
    allowLiveOrigins: input.allowLiveOrigins,
    allowedOrigin: input.allowedOrigin,
    flows: input.flows,
  });
  const policyWithStartPath =
    startPath && !policy.allowedRoutes.includes(startPath)
      ? {
          ...policy,
          allowedRoutes: Array.from(
            new Set([...policy.allowedRoutes, startPath]),
          ),
        }
      : policy;

  await writeDemoAgentPolicy(policyWithStartPath);

  return await readDemoAgentPolicy();
}
