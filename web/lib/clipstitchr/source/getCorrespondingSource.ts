const defaultSourceRepositoryUrl =
  "https://github.com/dqstartupbuild/clipstitchr";

function readPublicHttpUrl(value: string | undefined) {
  if (!value?.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function readSourceRevision(value: string | undefined) {
  const revision = value?.trim();

  return revision && /^[a-f0-9]{7,64}$/i.test(revision) ? revision : null;
}

export function getCorrespondingSource() {
  const repositoryUrl =
    readPublicHttpUrl(process.env.NEXT_PUBLIC_SOURCE_CODE_URL) ??
    defaultSourceRepositoryUrl;
  const revision = readSourceRevision(
    process.env.SOURCE_CODE_REVISION ?? process.env.VERCEL_GIT_COMMIT_SHA,
  );
  const configuredArchiveUrl = readPublicHttpUrl(
    process.env.SOURCE_CODE_ARCHIVE_URL,
  );

  return {
    archiveUrl:
      configuredArchiveUrl ??
      (revision ? `${repositoryUrl}/archive/${revision}.tar.gz` : null),
    repositoryUrl,
    revision,
    revisionUrl: revision
      ? `${repositoryUrl}/tree/${revision}`
      : repositoryUrl,
  } as const;
}
