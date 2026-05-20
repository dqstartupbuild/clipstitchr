import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MediaCardActionMenu } from "@/app/_components/ui/MediaCardActionMenu";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("MediaCardActionMenu", () => {
  it("renders nothing when there are no actions", () => {
    expect(
      renderToStaticMarkup(<MediaCardActionMenu items={[]} label="Actions" />),
    ).toBe("");
  });

  it("renders the closed action menu button", () => {
    const markup = renderToStaticMarkup(
      <MediaCardActionMenu
        label="Clip actions"
        items={[
          {
            href: "/dashboard/swapr",
            icon: <span>Icon</span>,
            label: "Use in Swapr",
          },
          {
            disabled: true,
            icon: <span>Icon</span>,
            label: "Delete",
            onClick: vi.fn(),
            variant: "danger",
          },
        ]}
      />,
    );

    expect(markup).toContain('aria-label="Clip actions"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).not.toContain('role="menu"');
  });
});
