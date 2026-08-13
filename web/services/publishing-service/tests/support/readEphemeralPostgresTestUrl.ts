const ALLOWED_HOSTS = new Set([
  "127.0.0.1",
  "localhost",
  "clipstitchr-postgres-test",
]);

export const readEphemeralPostgresTestUrl = (
  environment: NodeJS.ProcessEnv,
): string => {
  if (environment["STUDIO_PUBLISHING_TEST_POSTGRES_EPHEMERAL"] !== "true") {
    throw new Error("Ephemeral PostgreSQL test acknowledgement is required.");
  }

  const rawUrl = environment["STUDIO_PUBLISHING_TEST_STUDIO_PUBLISHING_DATABASE_URL"];

  if (rawUrl === undefined) {
    throw new Error("STUDIO_PUBLISHING_TEST_STUDIO_PUBLISHING_DATABASE_URL is required.");
  }

  const url = new URL(rawUrl);

  if (
    url.protocol !== "postgresql:" ||
    !ALLOWED_HOSTS.has(url.hostname) ||
    url.pathname !== "/clipstitchr_publishing_test"
  ) {
    throw new Error("PostgreSQL integration tests require the isolated test database.");
  }

  return rawUrl;
};
