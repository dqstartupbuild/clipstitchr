type SeedSwiprBackgroundLibraryOptions = {
  count: number;
};

type SeedSwiprBackgroundLibraryResult = {
  total: number;
  requested: number;
  saved: number;
  skipped: number;
  remaining: number;
  savedIds: string[];
};

export async function seedSwiprBackgroundLibrary({
  count,
}: SeedSwiprBackgroundLibraryOptions): Promise<SeedSwiprBackgroundLibraryResult> {
  const response = await fetch("/api/dev/swipr/backgrounds/seed", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ count }),
  });

  const body = (await response.json().catch(() => null)) as
    | (Partial<SeedSwiprBackgroundLibraryResult> & { message?: string })
    | null;

  if (!response.ok) {
    throw new Error(body?.message ?? "Unable to seed Swipr backgrounds.");
  }

  return {
    total: Number(body?.total ?? 0),
    requested: Number(body?.requested ?? 0),
    saved: Number(body?.saved ?? 0),
    skipped: Number(body?.skipped ?? 0),
    remaining: Number(body?.remaining ?? 0),
    savedIds: Array.isArray(body?.savedIds) ? body.savedIds : [],
  };
}
