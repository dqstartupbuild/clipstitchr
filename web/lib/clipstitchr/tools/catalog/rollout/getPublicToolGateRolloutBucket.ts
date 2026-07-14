const publicToolGateRolloutBucketCount = 10_000;

export function getPublicToolGateRolloutBucket(opaqueVisitorKey: string) {
  let hash = 2_166_136_261;

  for (let index = 0; index < opaqueVisitorKey.length; index += 1) {
    hash ^= opaqueVisitorKey.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return (hash >>> 0) % publicToolGateRolloutBucketCount;
}
