type StudioClipsTaskRequestIdentity = {
  includeArchived: boolean;
  productId: string;
  reloadKey: number;
};

export function getStudioClipsTaskRequestMatches(
  state: StudioClipsTaskRequestIdentity | null,
  expected: StudioClipsTaskRequestIdentity,
): boolean {
  return (
    state !== null &&
    state.includeArchived === expected.includeArchived &&
    state.productId === expected.productId &&
    state.reloadKey === expected.reloadKey
  );
}
