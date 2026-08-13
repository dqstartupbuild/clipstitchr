export function getStudioBetaOwnerIdArgument() {
  const ownerId = process.argv[2];

  if (!ownerId) {
    throw new Error("Pass one Clerk user ID, for example user_123.");
  }

  return ownerId;
}
