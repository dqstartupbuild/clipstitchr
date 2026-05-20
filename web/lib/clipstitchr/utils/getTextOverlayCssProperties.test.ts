import { describe, expect, it } from "vitest";
import { getTextOverlayCssProperties } from "@/lib/clipstitchr/utils/getTextOverlayCssProperties";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

describe("getTextOverlayCssProperties", () => {
  it("creates positioned overlay CSS from text overlay style settings", () => {
    const textOverlay: TextOverlay = {
      text: "Launch sale",
      startTime: 0,
      endTime: 2,
      x: 0.2,
      y: 0.3,
      width: 0.6,
      fontSize: 0.08,
      styleId: "hook",
      color: "#ffffff",
      strokeColor: "#111111",
    };

    expect(getTextOverlayCssProperties(textOverlay)).toMatchObject({
      WebkitTextStroke: "0.075em #111111",
      color: "#ffffff",
      fontFamily: "Impact, Arial Black, Arial, sans-serif",
      fontSize: "8cqh",
      fontWeight: "900",
      left: "20%",
      textShadow: "0.03em 0.05em 0.08em rgba(2, 6, 23, 0.45)",
      textTransform: "uppercase",
      top: "30%",
      width: "60%",
    });
  });

  it("uses full-width band positioning when the style requires it", () => {
    const textOverlay: TextOverlay = {
      text: "Tap to see why",
      startTime: 0,
      endTime: 2,
      x: 0.18,
      y: 0.74,
      width: 0.64,
      fontSize: 0.08,
      styleId: "snapchat",
    };

    expect(getTextOverlayCssProperties(textOverlay)).toMatchObject({
      backgroundColor: "rgba(108, 108, 108, 0.84)",
      borderRadius: undefined,
      fontSize: "6.24cqh",
      left: 0,
      padding: "0.14em 0.22em",
      top: "74%",
      width: "100%",
    });
  });
});
