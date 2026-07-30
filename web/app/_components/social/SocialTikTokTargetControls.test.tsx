import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SocialTikTokTargetControls } from "./SocialTikTokTargetControls";
import { createSocialComposeTargetDraft } from "@/lib/clipstitchr/social/createSocialComposeTargetDraft";

const account = {
  id: "account_1",
  platform: "tiktok" as const,
  username: "creator",
  displayName: "Creator",
  status: "connected",
  capabilitySnapshotJson: JSON.stringify({
    creator_nickname: "Creator",
    privacy_level_options: ["SELF_ONLY"],
    comment_disabled: false,
    duet_disabled: false,
    stitch_disabled: false,
    max_video_post_duration_sec: 60,
  }),
};

describe("SocialTikTokTargetControls", () => {
  it("shows sound choice only for direct photo posts and defaults it on", () => {
    const html = renderToStaticMarkup(
      <SocialTikTokTargetControls
        account={account}
        disabled={false}
        mediaKind="image"
        target={createSocialComposeTargetDraft(account.id, "tiktok")}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain("Let TikTok pick a sound");
    expect(html).toContain('checked=""');
    expect(html).not.toContain("Send to TikTok for finishing");
    expect(html).not.toContain("significantly edited with AI");
  });

  it("shows inbox delivery for videos and hides photo sound", () => {
    const html = renderToStaticMarkup(
      <SocialTikTokTargetControls
        account={account}
        disabled={false}
        mediaKind="video"
        target={createSocialComposeTargetDraft(account.id, "tiktok")}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain("Post automatically");
    expect(html).toContain("Send to TikTok for finishing");
    expect(html).not.toContain("Let TikTok pick a sound");
    expect(html).toContain("Choose before posting");
    expect(html).toContain("significantly edited with AI");
    expect(html).toContain("TikTok will add its AI-generated content label.");
  });

  it("removes Only you while paid branded content is selected", () => {
    const target = createSocialComposeTargetDraft(account.id, "tiktok");
    const html = renderToStaticMarkup(
      <SocialTikTokTargetControls
        account={{
          ...account,
          capabilitySnapshotJson: JSON.stringify({
            creator_nickname: "Creator",
            privacy_level_options: ["SELF_ONLY", "PUBLIC_TO_EVERYONE"],
            comment_disabled: false,
            duet_disabled: false,
            stitch_disabled: false,
            max_video_post_duration_sec: 60,
          }),
        }}
        disabled={false}
        mediaKind="video"
        target={{
          ...target,
          brandContentToggle: true,
          commercialContentEnabled: true,
        }}
        onChange={vi.fn()}
      />,
    );

    expect(html).not.toContain('value="SELF_ONLY"');
    expect(html).toContain('value="PUBLIC_TO_EVERYONE"');
    expect(html).toContain(
      "Paid branded content must be visible to more than Only you.",
    );
  });

  it("allows both promotion disclosures and labels the result", () => {
    const target = createSocialComposeTargetDraft(account.id, "tiktok");
    const html = renderToStaticMarkup(
      <SocialTikTokTargetControls
        account={account}
        disabled={false}
        mediaKind="video"
        target={{
          ...target,
          brandContentToggle: true,
          brandOrganicToggle: true,
          commercialContentEnabled: true,
        }}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain("My own brand or business");
    expect(html).toContain("Paid partnership with another brand");
    expect(html).toContain("TikTok will label this as Paid partnership.");
  });

  it("does not show direct-post controls for inbox delivery", () => {
    const html = renderToStaticMarkup(
      <SocialTikTokTargetControls
        account={account}
        disabled={false}
        mediaKind="video"
        target={{
          ...createSocialComposeTargetDraft(account.id, "tiktok"),
          publishMode: "draft",
        }}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain("finish the post in TikTok");
    expect(html).not.toContain("Allow comments");
    expect(html).not.toContain("promotes a brand");
    expect(html).not.toContain("significantly edited with AI");
  });

  it("preserves an explicit AI-generated video disclosure", () => {
    const html = renderToStaticMarkup(
      <SocialTikTokTargetControls
        account={account}
        disabled={false}
        mediaKind="video"
        target={{
          ...createSocialComposeTargetDraft(account.id, "tiktok"),
          isAigc: true,
        }}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain("significantly edited with AI");
    expect(html).toContain('checked=""');
  });

  it("shows the current account-specific video duration limit", () => {
    const html = renderToStaticMarkup(
      <SocialTikTokTargetControls
        account={account}
        disabled={false}
        mediaKind="video"
        target={createSocialComposeTargetDraft(account.id, "tiktok")}
        videoDurationSeconds={75}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain("This video is 75 seconds");
    expect(html).toContain("accepts videos up to 60 seconds");
  });
});
