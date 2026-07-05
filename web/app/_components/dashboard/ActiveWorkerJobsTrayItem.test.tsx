import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActiveWorkerJobsTrayItem } from "@/app/_components/dashboard/ActiveWorkerJobsTrayItem";

describe("ActiveWorkerJobsTrayItem", () => {
  it("renders fractional job progress as a percent label and bar width", () => {
    const markup = renderToStaticMarkup(
      <ActiveWorkerJobsTrayItem
        job={{
          id: "job_1",
          jobType: "manual-swapr",
          progress: 0.68,
          stage: "running",
          status: "running",
        }}
      />,
    );

    expect(markup).toContain("Swapr generation");
    expect(markup).toContain("68%");
    expect(markup).toContain("width:68%");
  });
});
