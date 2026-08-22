import { describe, expect, it } from "vitest";
import { createBreadcrumbJsonLd } from "@/lib/clipstitchr/seo/createBreadcrumbJsonLd";

describe("createBreadcrumbJsonLd", () => {
  it("creates canonical, ordered breadcrumb items", () => {
    const data = createBreadcrumbJsonLd([
      { name: "Home", pathname: "/" },
      { name: "Tools", pathname: "/tools" },
    ]);

    expect(data).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { position: 1, name: "Home", item: "http://localhost:3000/" },
        { position: 2, name: "Tools", item: "http://localhost:3000/tools" },
      ],
    });
  });
});
