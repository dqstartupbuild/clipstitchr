import { describe, expect, it } from "vitest";
import { getAccountSwiprLibraryPacks } from "@/lib/clipstitchr/utils/getAccountSwiprLibraryPacks";

describe("getAccountSwiprLibraryPacks", () => {
  it("returns account packs with account-specific counts and covers", () => {
    expect(
      getAccountSwiprLibraryPacks([
        {
          accountCount: 166,
          accountCovers: [
            {
              backgroundId: "account_cover",
              imageObject: {
                contentType: "image/jpeg",
                key: "packs/account-cover.jpg",
                size: 12,
              },
            },
          ],
          count: 170,
          coverBackgroundIds: ["global_cover"],
          isInAccount: true,
          name: "calisthenics",
        },
        {
          count: 82,
          coverBackgroundIds: ["pushups_cover"],
          isInAccount: false,
          name: "Pushups",
        },
      ]),
    ).toEqual([
      {
        accountCount: 166,
        accountCovers: [
          {
            backgroundId: "account_cover",
            imageObject: {
              contentType: "image/jpeg",
              key: "packs/account-cover.jpg",
              size: 12,
            },
          },
        ],
        count: 166,
        coverBackgroundIds: ["account_cover"],
        covers: [
          {
            backgroundId: "account_cover",
            imageObject: {
              contentType: "image/jpeg",
              key: "packs/account-cover.jpg",
              size: 12,
            },
          },
        ],
        isInAccount: true,
        name: "calisthenics",
      },
    ]);
  });
});
