const DEFAULT_POST_BRIDGE_MAX_MEDIA_BYTES = 250 * 1024 * 1024;

export function getPostBridgeMaxMediaBytes() {
  const configuredValue = process.env.POST_BRIDGE_MAX_MEDIA_BYTES;
  const parsedValue = configuredValue
    ? Number.parseInt(configuredValue, 10)
    : Number.NaN;

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : DEFAULT_POST_BRIDGE_MAX_MEDIA_BYTES;
}
