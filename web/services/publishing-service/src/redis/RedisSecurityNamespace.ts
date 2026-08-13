declare const redisSecurityNamespaceBrand: unique symbol;

export type RedisSecurityNamespace = string & {
  readonly [redisSecurityNamespaceBrand]: "redis-security-namespace";
};
