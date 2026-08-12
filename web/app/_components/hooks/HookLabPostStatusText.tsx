import type { HookLabPostStatus } from "@/lib/clipstitchr/types/HookLabPostStatus";

export function HookLabPostStatusText({
  status,
}: {
  status: HookLabPostStatus;
}) {
  const copy = {
    analyzing: "Analysis in progress",
    failed: "Analysis failed",
    needs_attention: "Needs a fresh analysis",
    ready: "Analysis ready",
  }[status];

  return (
    <p
      className={[
        "text-xs font-semibold",
        status === "failed" || status === "needs_attention"
          ? "text-accent-dark"
          : status === "ready"
            ? "text-accent-dark"
            : "text-text-tertiary",
      ].join(" ")}
    >
      {copy}
    </p>
  );
}
