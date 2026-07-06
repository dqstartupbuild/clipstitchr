import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CliConnectPageClient } from "@/app/cli/connect/CliConnectPageClient";

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({
    redirectToSignIn: vi.fn(),
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
  }),
}));

describe("CliConnectPageClient", () => {
  it("shows a code confirmation form before approving a CLI connection", () => {
    const markup = renderToStaticMarkup(
      <CliConnectPageClient userCode="ABC123" />,
    );

    expect(markup).toContain("Connect this machine");
    expect(markup).toContain("Terminal code");
    expect(markup).toContain("ABC123");
    expect(markup).toContain("make sure this code matches");
    expect(markup).not.toContain("You are connected.");
  });

  it("lets users enter a terminal code when the URL does not include one", () => {
    const markup = renderToStaticMarkup(<CliConnectPageClient />);

    expect(markup).toContain("Terminal code");
    expect(markup).toContain("ABC123");
    expect(markup).toContain("Cancel");
  });
});
