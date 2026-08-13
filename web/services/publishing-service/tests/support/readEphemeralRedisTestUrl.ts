const SAFE_REDIS_HOST_PATTERN = /^clipstitchr-test-redis-[a-z0-9-]+$/;
const LOOPBACK_REDIS_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

export const readEphemeralRedisTestUrl = (
  input: NodeJS.ProcessEnv = process.env,
): string => {
  const value = input["STUDIO_PUBLISHING_TEST_STUDIO_PUBLISHING_REDIS_URL"];

  if (
    input["STUDIO_PUBLISHING_TEST_REDIS_EPHEMERAL"] !== "true" ||
    value === undefined
  ) {
    throw new Error("Ephemeral Redis integration testing is not enabled.");
  }

  try {
    const parsedUrl = new URL(value);

    if (
      parsedUrl.protocol !== "redis:" ||
      (!LOOPBACK_REDIS_HOSTS.has(parsedUrl.hostname) &&
        !SAFE_REDIS_HOST_PATTERN.test(parsedUrl.hostname)) ||
      parsedUrl.username.length > 0 ||
      parsedUrl.password.length > 0 ||
      (parsedUrl.pathname !== "" && parsedUrl.pathname !== "/" &&
        parsedUrl.pathname !== "/0") ||
      parsedUrl.search.length > 0 ||
      parsedUrl.hash.length > 0
    ) {
      throw new Error("Unsafe Redis integration test target.");
    }

    return parsedUrl.toString();
  } catch {
    throw new Error("Unsafe Redis integration test target.");
  }
};
