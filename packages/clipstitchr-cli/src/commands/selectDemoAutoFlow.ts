import type { ScannedFlow } from "../project/ScannedFlow.js";

export function selectDemoAutoFlow(input: {
  flows: ScannedFlow[];
  localUrl?: string;
}) {
  const pathname = input.localUrl ? new URL(input.localUrl).pathname : undefined;
  const matchingFlow = pathname
    ? input.flows.find((flow) => flow.path === pathname)
    : undefined;

  return (
    matchingFlow ??
    input.flows.find((flow) => flow.confidence === "high") ??
    input.flows[0]
  );
}
