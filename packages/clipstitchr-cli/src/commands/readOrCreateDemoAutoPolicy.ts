import type { DemoAgentPolicy } from "../demoAgent/DemoAgentPolicy.js";
import { createDemoAgentPolicy } from "../demoAgent/createDemoAgentPolicy.js";
import { readDemoAgentPolicy } from "../demoAgent/readDemoAgentPolicy.js";
import { writeDemoAgentPolicy } from "../demoAgent/writeDemoAgentPolicy.js";
import type { ScannedFlow } from "../project/ScannedFlow.js";

export async function readOrCreateDemoAutoPolicy(input: {
  allowedOrigin: string;
  flows: ScannedFlow[];
  startPath?: string;
}): Promise<{
  hash: string;
  path: string;
  policy: DemoAgentPolicy;
}> {
  try {
    return await readDemoAgentPolicy();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  const policy = createDemoAgentPolicy({
    allowedOrigin: input.allowedOrigin,
    flows: input.flows,
  });
  const startPath =
    input.startPath && input.startPath.startsWith("/")
      ? input.startPath
      : undefined;
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
