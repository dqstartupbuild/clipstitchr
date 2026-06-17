type ImportPexelsPhotosToSwiprLibraryOptions = {
  count: number;
  query: string;
};

export async function importPexelsPhotosToSwiprLibrary({
  count,
  query,
}: ImportPexelsPhotosToSwiprLibraryOptions) {
  const response = await fetch("/api/swipr/pexels/import", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ count, query }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to import Pexels photos.");
  }

  return (await response.json()) as {
    ids: string[];
    imported: number;
    query: string;
    searched: number;
  };
}
