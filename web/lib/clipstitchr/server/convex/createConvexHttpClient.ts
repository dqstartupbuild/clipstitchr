import { ConvexHttpClient } from "convex/browser";
import { resolveConvexCloudUrl } from "./resolveConvexCloudUrl";

export function createConvexHttpClient() {
  return new ConvexHttpClient(resolveConvexCloudUrl());
}
