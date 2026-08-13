import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishingIntegrations } from "@/app/_components/publishing/integrations/PublishingIntegrations";
import PublishingConnectionsPage from "@/app/dashboard/studio/publishing/connections/page";
import PublishingIntegrationsPage from "@/app/dashboard/studio/publishing/integrations/page";

const navigation = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => navigation);

describe("publishing connection routes", () => {
  beforeEach(() => {
    navigation.redirect.mockClear();
  });

  it("uses Connections as the working account route", () => {
    expect(PublishingConnectionsPage().type).toBe(PublishingIntegrations);
  });

  it("keeps the old integrations path as a compatibility redirect", () => {
    PublishingIntegrationsPage();

    expect(navigation.redirect).toHaveBeenCalledWith(
      "/dashboard/studio/publishing/connections",
    );
  });
});
