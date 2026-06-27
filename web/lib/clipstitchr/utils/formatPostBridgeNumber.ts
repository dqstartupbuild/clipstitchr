export function formatPostBridgeNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
