import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SocialConnectionNotice } from "./SocialConnectionNotice";

describe("SocialConnectionNotice", () => {
  it("shows a successful platform connection", () => {
    const markup = renderToStaticMarkup(
      <SocialConnectionNotice
        platform="instagram"
        status="connected"
      />,
    );

    expect(markup).toContain("Instagram is connected.");
    expect(markup).toContain('role="status"');
  });

  it("keeps token-exchange failures useful and nontechnical", () => {
    const markup = renderToStaticMarkup(
      <SocialConnectionNotice
        platform="tiktok"
        reason="token_exchange"
        status="connection_failed"
      />,
    );

    expect(markup).toContain("TikTok approved access");
    expect(markup).toContain('role="alert"');
    expect(markup).not.toContain("token_exchange");
  });
});
