export function getLazyReelIdentityLabel(identity: {
  kind: "tool" | "workflow";
  key: string;
}) {
  const title = identity.key
    .split("_")
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(" ");

  return identity.kind === "workflow" ? `${title} planner` : title;
}
