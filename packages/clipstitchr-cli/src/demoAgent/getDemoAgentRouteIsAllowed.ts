export function getDemoAgentRouteIsAllowed(pathname: string, route: string) {
  return route === pathname || (route !== "/" && pathname.startsWith(`${route}/`));
}
