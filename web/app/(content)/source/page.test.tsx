import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import SourcePage from "@/app/(content)/source/page";

const originalSourceCodeUrl = process.env.NEXT_PUBLIC_SOURCE_CODE_URL;
const originalSourceCodeRevision = process.env.SOURCE_CODE_REVISION;
const originalSourceCodeArchiveUrl = process.env.SOURCE_CODE_ARCHIVE_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_SOURCE_CODE_URL = originalSourceCodeUrl;
  process.env.SOURCE_CODE_REVISION = originalSourceCodeRevision;
  process.env.SOURCE_CODE_ARCHIVE_URL = originalSourceCodeArchiveUrl;
});

describe("SourcePage", () => {
  it("links the exact deployed source and archive", () => {
    process.env.NEXT_PUBLIC_SOURCE_CODE_URL =
      "https://example.com/clipstitchr";
    process.env.SOURCE_CODE_REVISION = "63208035212480ea";
    delete process.env.SOURCE_CODE_ARCHIVE_URL;

    const markup = renderToStaticMarkup(<SourcePage />);

    expect(markup).toContain("ClipStitchr source code");
    expect(markup).toContain(
      'href="https://example.com/clipstitchr/tree/63208035212480ea"',
    );
    expect(markup).toContain(
      'href="https://example.com/clipstitchr/archive/63208035212480ea.tar.gz"',
    );
    expect(markup).toContain("GNU Affero General Public License version 3");
  });
});
