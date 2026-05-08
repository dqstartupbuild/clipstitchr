import type { Auth } from "convex/server";

type AuthenticatedContext = {
  auth: Auth;
};

export async function getAuthenticatedOwnerId(ctx: AuthenticatedContext) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  return identity.subject;
}
