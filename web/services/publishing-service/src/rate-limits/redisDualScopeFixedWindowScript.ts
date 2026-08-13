export const redisDualScopeFixedWindowScript = `
local globalLimit = tonumber(ARGV[1])
local globalWindow = tonumber(ARGV[2])
local tenantLimit = tonumber(ARGV[3])
local tenantWindow = tonumber(ARGV[4])
local cost = tonumber(ARGV[5])

if not globalLimit or not globalWindow or not tenantLimit or not tenantWindow or not cost then
  return redis.error_reply("invalid rate-limit arguments")
end

local timeParts = redis.call("TIME")
local now = (tonumber(timeParts[1]) * 1000) + math.floor(tonumber(timeParts[2]) / 1000)

local function inspectScope(key, limit, window)
  local bucket = math.floor(now / window)
  local values = redis.call("HMGET", key, "bucket", "count")
  local count = 0

  if values[1] and tonumber(values[1]) == bucket then
    count = tonumber(values[2]) or 0
  end

  return {
    bucket,
    count,
    count + cost,
    (bucket + 1) * window,
    limit
  }
end

local globalScope = inspectScope(KEYS[1], globalLimit, globalWindow)
local tenantScope = inspectScope(KEYS[2], tenantLimit, tenantWindow)
local allowed = globalScope[3] <= globalScope[5] and tenantScope[3] <= tenantScope[5]

if allowed then
  redis.call("HSET", KEYS[1], "bucket", globalScope[1], "count", globalScope[3])
  redis.call("PEXPIREAT", KEYS[1], globalScope[4] + 1000)
  redis.call("HSET", KEYS[2], "bucket", tenantScope[1], "count", tenantScope[3])
  redis.call("PEXPIREAT", KEYS[2], tenantScope[4] + 1000)
end

local globalCount = allowed and globalScope[3] or globalScope[2]
local tenantCount = allowed and tenantScope[3] or tenantScope[2]

return {
  allowed and 1 or 0,
  now,
  math.max(0, globalScope[5] - globalCount),
  globalScope[4],
  math.max(0, tenantScope[5] - tenantCount),
  tenantScope[4]
}
`;
