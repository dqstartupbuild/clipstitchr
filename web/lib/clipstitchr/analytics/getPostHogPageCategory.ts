export function getPostHogPageCategory(pathname: string) {
  if (pathname === "/") {
    return "landing";
  }

  if (pathname.startsWith("/dashboard")) {
    return "dashboard";
  }

  if (pathname.startsWith("/sign-in")) {
    return "auth_sign_in";
  }

  if (pathname.startsWith("/sign-up")) {
    return "auth_sign_up";
  }

  if (pathname.startsWith("/docs")) {
    return "docs";
  }

  if (pathname.startsWith("/tools")) {
    return "tools";
  }

  if (pathname.startsWith("/privacy")) {
    return "legal";
  }

  return "site";
}
