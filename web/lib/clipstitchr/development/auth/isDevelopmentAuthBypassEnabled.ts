type DevelopmentAuthBypassEnvironment = {
  enabledValue?: string;
  hostname: string;
  nodeEnv?: string;
};

export function isDevelopmentAuthBypassEnabled({
  enabledValue,
  hostname,
  nodeEnv,
}: DevelopmentAuthBypassEnvironment): boolean {
  if (nodeEnv !== "development" || enabledValue !== "true") {
    return false;
  }

  const firstHost = hostname.split(",", 1)[0]?.trim().toLowerCase() ?? "";
  const bracketedIpv6 = firstHost.match(/^\[([^\]]+)](?::\d+)?$/)?.[1];
  const hostWithoutPort = bracketedIpv6 ?? firstHost.replace(/:\d+$/, "");

  if (hostWithoutPort === "localhost" || hostWithoutPort === "::1") {
    return true;
  }

  if (/^127(?:\.\d{1,3}){3}$/.test(hostWithoutPort)) {
    return hostWithoutPort
      .split(".")
      .every((part) => Number.parseInt(part, 10) <= 255);
  }

  if (/^::ffff:127(?:\.\d{1,3}){3}$/.test(hostWithoutPort)) {
    return hostWithoutPort
      .slice("::ffff:".length)
      .split(".")
      .every((part) => Number.parseInt(part, 10) <= 255);
  }

  return false;
}
