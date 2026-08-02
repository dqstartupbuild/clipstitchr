export class InvalidRedisSecurityNamespaceError extends Error {
  constructor() {
    super("Redis security namespace is invalid.");
    this.name = "InvalidRedisSecurityNamespaceError";
  }
}
