export function getInstagramGraphApiVersion() {
  const version = process.env.INSTAGRAM_GRAPH_API_VERSION?.trim() || "v25.0";

  if (!/^v\d+\.\d+$/.test(version)) {
    throw new Error("INSTAGRAM_GRAPH_API_VERSION is invalid.");
  }

  return version;
}
