export type ReadinessCheckResult = Readonly<{
  name: string;
  status: "ready" | "not_ready";
}>;
