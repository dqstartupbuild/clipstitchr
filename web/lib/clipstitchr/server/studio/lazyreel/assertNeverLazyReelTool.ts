export function assertNeverLazyReelTool(value: never): never {
  throw new TypeError(`Unsupported LazyReel tool: ${String(value)}`);
}
