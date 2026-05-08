import { auth } from "@clerk/nextjs/server";

export async function getAuthenticatedConvexToken() {
  const { userId, getToken } = await auth();

  if (!userId) {
    return null;
  }

  return await getToken({ template: "convex" });
}
