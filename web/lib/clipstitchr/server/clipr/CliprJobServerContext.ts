import type { ConvexHttpClient } from "convex/browser";

export type CliprJobServerContext = {
  convex: ConvexHttpClient;
  secret: string;
};
