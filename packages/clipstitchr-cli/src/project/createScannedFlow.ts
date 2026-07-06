import type { ScannedFlow } from "./ScannedFlow.js";

export function createScannedFlow(routePath: string): ScannedFlow {
  if (/sign-?up|register|onboard/i.test(routePath)) {
    return {
      confidence: "high",
      name: "Sign up and reach the first useful screen",
      path: routePath,
    };
  }

  if (/upload|import/i.test(routePath)) {
    return {
      confidence: "high",
      name: "Upload a clip",
      path: routePath,
    };
  }

  if (/dashboard|project|workspace/i.test(routePath)) {
    return {
      confidence: "medium",
      name: "Show the main workspace",
      path: routePath,
    };
  }

  if (/export|download|publish/i.test(routePath)) {
    return {
      confidence: "medium",
      name: "Export or publish a result",
      path: routePath,
    };
  }

  return {
    confidence: routePath === "/" ? "medium" : "low",
    name: routePath === "/" ? "Open the product" : `Show ${routePath}`,
    path: routePath,
  };
}
