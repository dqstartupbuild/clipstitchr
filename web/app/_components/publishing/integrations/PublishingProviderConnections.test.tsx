import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PublishingProviderConnections } from "@/app/_components/publishing/integrations/PublishingProviderConnections";

describe("PublishingProviderConnections", () => {
  it("offers a real YouTube account connection when the gateway enables it", () => {
    const markup = renderToStaticMarkup(
      <PublishingProviderConnections
        connectError={null}
        connectionBusy={false}
        group={{
          canConnect: true,
          integrations: [],
          provider: "youtube",
          unavailableReason: null,
        }}
        isConnecting={false}
        onChanged={vi.fn()}
        onConnect={vi.fn()}
      />,
    );

    expect(markup).toContain("YouTube logo");
    expect(markup).toContain("Connect YouTube");
    expect(markup).not.toContain("disabled");
  });

  it("shows the gateway reason instead of enabling a dead connection", () => {
    const markup = renderToStaticMarkup(
      <PublishingProviderConnections
        connectError={null}
        connectionBusy={false}
        group={{
          canConnect: false,
          integrations: [],
          provider: "youtube",
          unavailableReason: "YouTube setup is not available yet.",
        }}
        isConnecting={false}
        onChanged={vi.fn()}
        onConnect={vi.fn()}
      />,
    );

    expect(markup).toContain("disabled");
    expect(markup).toContain("YouTube setup is not available yet.");
  });
});
