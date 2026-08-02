import { afterEach, describe, expect, it } from "vitest";
import { getCorrespondingSource } from "@/lib/clipstitchr/source/getCorrespondingSource";

const originalSourceCodeUrl = process.env.NEXT_PUBLIC_SOURCE_CODE_URL;
const originalSourceCodeRevision = process.env.SOURCE_CODE_REVISION;
const originalSourceCodeArchiveUrl = process.env.SOURCE_CODE_ARCHIVE_URL;
const originalVercelRevision = process.env.VERCEL_GIT_COMMIT_SHA;

afterEach(() => {
  process.env.NEXT_PUBLIC_SOURCE_CODE_URL = originalSourceCodeUrl;
  process.env.SOURCE_CODE_REVISION = originalSourceCodeRevision;
  process.env.SOURCE_CODE_ARCHIVE_URL = originalSourceCodeArchiveUrl;
  process.env.VERCEL_GIT_COMMIT_SHA = originalVercelRevision;
});

describe("getCorrespondingSource", () => {
  it("builds exact source and archive links for a deployed revision", () => {
    process.env.NEXT_PUBLIC_SOURCE_CODE_URL =
      "https://example.com/clipstitchr/";
    process.env.SOURCE_CODE_REVISION = "63208035212480ea";
    delete process.env.SOURCE_CODE_ARCHIVE_URL;

    expect(getCorrespondingSource()).toEqual({
      archiveUrl:
        "https://example.com/clipstitchr/archive/63208035212480ea.tar.gz",
      repositoryUrl: "https://example.com/clipstitchr",
      revision: "63208035212480ea",
      revisionUrl:
        "https://example.com/clipstitchr/tree/63208035212480ea",
    });
  });

  it("does not expose an invalid configured URL or revision", () => {
    process.env.NEXT_PUBLIC_SOURCE_CODE_URL = "javascript:alert(1)";
    process.env.SOURCE_CODE_REVISION = "not a revision";
    process.env.SOURCE_CODE_ARCHIVE_URL = "file:///tmp/source.tar.gz";
    delete process.env.VERCEL_GIT_COMMIT_SHA;

    expect(getCorrespondingSource()).toEqual({
      archiveUrl: null,
      repositoryUrl: "https://github.com/dqstartupbuild/clipstitchr",
      revision: null,
      revisionUrl: "https://github.com/dqstartupbuild/clipstitchr",
    });
  });
});
