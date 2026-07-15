import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicToolEmailNativeEnrollmentControl } from "@/app/_components/tools/gates/PublicToolEmailNativeEnrollmentControl";
import type { PublicToolEmailNativeEnrollmentStatus } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolEmailNativeEnrollmentStatus";

const mocks = vi.hoisted(() => ({
  requestEnrollment: vi.fn(),
  status: "idle" as PublicToolEmailNativeEnrollmentStatus,
}));

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/usePublicToolEmailNativeEnrollment",
  () => ({
    usePublicToolEmailNativeEnrollment: () => mocks,
  }),
);

describe("PublicToolEmailNativeEnrollmentControl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.status = "idle";
  });

  it("offers an explicit one-click request without exposing contact details", () => {
    const markup = renderToStaticMarkup(
      <PublicToolEmailNativeEnrollmentControl toolKey="five-day-app-content-sprint" />,
    );

    expect(markup).toContain("Open this course");
    expect(markup).toContain("confirmed email securely linked");
    expect(markup).not.toMatch(/@|recognition token|workflow key/i);
  });

  it("uses conditional, non-delivery success copy", () => {
    mocks.status = "accepted";

    const markup = renderToStaticMarkup(
      <PublicToolEmailNativeEnrollmentControl toolKey="five-day-app-content-sprint" />,
    );

    expect(markup).toContain("Course request received.");
    expect(markup).toContain("Refresh this page");
    expect(markup).not.toMatch(
      /enrollment started|series has started|sent|delivered|check your inbox/i,
    );
  });
});
