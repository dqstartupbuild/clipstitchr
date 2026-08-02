# Publishing Redis Runtime

`createIoredisPublishingRedisRuntime` is the concrete Redis boundary for
publishing security state. It uses the retained ioredis 5.x dependency already
used by the Postiz source baseline and is installed through the single
`web/package-lock.json` workspace lockfile.

## Lifecycle

Create one runtime from the parsed `REDIS_URL`, call `connect` during service
startup, and register `createPublishingRedisReadinessDependency(runtime)` with
the readiness handler. Call `close` during graceful shutdown.

The runtime confirms connection health with `PING`. Commands are rejected until
the client is ready and after it closes. Offline queueing, automatic reconnect,
and request retries are disabled. A connection or command failure produces only
`PublishingRedisUnavailableError`, with no URL, hostname, username, password,
or low-level client error attached.

The adapter exposes the command contract required by:

- `RedisServiceAssertionReplayProtector`: atomic `SET NX PX`;
- `RedisOAuthAuthorizationStateStore`: `GETDEL` and the `GET` plus compare-and-
  delete Lua fallback;
- `RedisPublishingRateLimiter`: one Lua invocation for the tenant and global
  scopes.

A read-only probe of the currently configured cloud deployment reported Redis
8.2.0 on 2026-08-02. That version supports the preferred `GETDEL` operation.
The compare-and-delete Lua fallback remains part of the adapter contract for
portability. The probe did not read or write application keys.

Every consumer also requires a validated `PUBLISHING_REDIS_NAMESPACE`. This
namespace is deployment configuration, never request input. It prevents equal
logical keys in development, staging, production, or tests from colliding.

## Disposable integration tests

The real-Redis suite refuses to run unless both safety variables are present:

- `PUBLISHING_TEST_REDIS_EPHEMERAL=true`;
- `PUBLISHING_TEST_REDIS_URL` points to an unauthenticated Redis database 0 on
  loopback or a Docker host named `clipstitchr-test-redis-*`.

The suite never calls `FLUSHDB` or `FLUSHALL`. Every test generates its own
deployment namespace, and the Redis container must be disposable. Example from
`web/`:

```bash
docker run -d --rm \
  --name clipstitchr-test-redis-local \
  -p 127.0.0.1:6389:6379 \
  redis:7.4-alpine

PUBLISHING_TEST_REDIS_EPHEMERAL=true \
PUBLISHING_TEST_REDIS_URL=redis://127.0.0.1:6389/0 \
npm run publishing-service:test:redis

docker stop clipstitchr-test-redis-local
```

Never point this command at staging or production Redis. The URL validator
intentionally rejects remote hosts, credentials, nonzero databases, TLS URLs,
queries, and fragments.
