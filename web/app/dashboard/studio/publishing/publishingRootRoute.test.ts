import { beforeEach, describe, expect, it, vi } from "vitest";
import PublishingPage from "./page";

const navigation = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => navigation);

describe("PublishingPage", () => {
  beforeEach(() => {
    navigation.redirect.mockClear();
  });

  it("opens the durable calendar from the shared Publish navigation", () => {
    PublishingPage();

    expect(navigation.redirect).toHaveBeenCalledWith(
      "/dashboard/studio/publishing/calendar",
    );
  });
});
