import { afterEach, describe, expect, it, vi } from "vitest";
import { UPLOAD_CONTROLS_HASH } from "@/lib/clipstitchr/constants/uploadControlsHash";
import { UPLOAD_CONTROLS_SEARCH_PARAM } from "@/lib/clipstitchr/constants/uploadControlsSearchParam";
import { removeUploadControlsUrlState } from "@/lib/clipstitchr/utils/removeUploadControlsUrlState";

describe("removeUploadControlsUrlState", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("leaves the URL alone when upload controls state is absent", () => {
    const replaceState = vi.fn();

    vi.stubGlobal("window", {
      history: {
        replaceState,
      },
      location: {
        hash: "",
        href: "https://clipstitchr.test/dashboard/uploads",
        search: "",
      },
    });

    removeUploadControlsUrlState();

    expect(replaceState).not.toHaveBeenCalled();
  });

  it("removes upload controls hash and search state", () => {
    const replaceState = vi.fn();

    vi.stubGlobal("window", {
      history: {
        replaceState,
      },
      location: {
        hash: UPLOAD_CONTROLS_HASH,
        href: `https://clipstitchr.test/dashboard/uploads?${UPLOAD_CONTROLS_SEARCH_PARAM}=open&tab=ugc${UPLOAD_CONTROLS_HASH}`,
        search: `?${UPLOAD_CONTROLS_SEARCH_PARAM}=open&tab=ugc`,
      },
    });

    removeUploadControlsUrlState();

    expect(replaceState).toHaveBeenCalledWith(
      null,
      "",
      "https://clipstitchr.test/dashboard/uploads?tab=ugc",
    );
  });
});
