export function getReplicateToken() {
  return process.env.REPLICATE_API_TOKEN ?? process.env.REPLICATE_KEY ?? null;
}
