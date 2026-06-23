const bearerPrefix = "Bearer ";

export function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith(bearerPrefix)) {
    return "";
  }

  return authorization.slice(bearerPrefix.length).trim();
}
