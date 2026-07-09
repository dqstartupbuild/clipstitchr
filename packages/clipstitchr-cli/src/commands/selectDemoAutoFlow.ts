import type { ScannedFlow } from "../project/ScannedFlow.js";

export function selectDemoAutoFlow(input: {
  flows: ScannedFlow[];
  localUrl?: string;
  preferUrlPath?: boolean;
}) {
  const pathname = input.localUrl ? new URL(input.localUrl).pathname : undefined;
  const matchingFlow = pathname && (pathname !== "/" || input.preferUrlPath)
    ? input.flows.find((flow) => flow.path === pathname)
    : undefined;
  const workspaceFlow = input.flows.find((flow) =>
    flow.path ? /dashboard|project|workspace/i.test(flow.path) : false,
  );

  return (
    matchingFlow ??
    input.flows.find((flow) => flow.confidence === "high") ??
    workspaceFlow ??
    input.flows[0]
  );
}
