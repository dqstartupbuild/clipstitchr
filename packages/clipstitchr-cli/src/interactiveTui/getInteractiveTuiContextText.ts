import type { InteractiveShellContext } from "../interactiveShell/InteractiveShellContext.js";

export function getInteractiveTuiContextText(
  context: InteractiveShellContext,
) {
  const productLabel = context.productLabel?.trim();
  const product = productLabel
    ? productLabel.length > 28
      ? `${productLabel.slice(0, 25)}...`
      : productLabel
    : "not set";

  return [
    `Product: ${product}`,
    `Repo: ${context.isRepoLinked ? "linked" : "not linked"}`,
    `Account: ${context.isAccountConnected ? "connected" : "not connected"}`,
  ].join(" | ");
}
