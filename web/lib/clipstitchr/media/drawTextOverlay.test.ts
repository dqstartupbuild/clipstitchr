import { describe, expect, it, vi } from "vitest";
import { drawTextOverlay } from "@/lib/clipstitchr/media/drawTextOverlay";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

function createContext(width = 1080, height = 1920) {
  const context = {
    beginPath: vi.fn(),
    canvas: { height, width },
    closePath: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    lineTo: vi.fn(),
    measureText: vi.fn((text: string) => ({
      width: text.length * 42,
    })),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    strokeText: vi.fn(),
  };

  return context as unknown as CanvasRenderingContext2D & typeof context;
}

function createOverlay(
  overrides: Partial<TextOverlay> = {},
): TextOverlay {
  return {
    endTime: 5,
    fontSize: 0.08,
    startTime: 1,
    styleId: "caption",
    text: "One two three four",
    width: 0.35,
    x: 0.2,
    y: 0.3,
    ...overrides,
  };
}

describe("drawTextOverlay", () => {
  it("does nothing when the overlay is hidden at the current time", () => {
    const context = createContext();

    drawTextOverlay(context, createOverlay({ text: "   " }), 2);
    drawTextOverlay(context, createOverlay(), 9);

    expect(context.save).not.toHaveBeenCalled();
    expect(context.fillText).not.toHaveBeenCalled();
  });

  it("draws wrapped text with a rounded background", () => {
    const context = createContext();

    drawTextOverlay(
      context,
      createOverlay({
        backgroundColor: "#112233",
        y: 0.98,
      }),
      2,
    );

    expect(context.save).toHaveBeenCalledTimes(1);
    expect(context.beginPath).toHaveBeenCalledTimes(1);
    expect(context.quadraticCurveTo).toHaveBeenCalledTimes(4);
    expect(context.fill).toHaveBeenCalledTimes(1);
    expect(context.fillText).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    );
    expect(context.restore).toHaveBeenCalledTimes(1);
  });

  it("uppercases and strokes hook text while splitting long lines", () => {
    const context = createContext(360, 640);

    drawTextOverlay(
      context,
      createOverlay({
        styleId: "hook",
        text: "supercalifragilistic",
        width: 0.12,
      }),
      2,
    );

    expect(context.strokeText).toHaveBeenCalled();
    expect(context.fillText.mock.calls[0][0]).toBe("S");
    expect(context.fillText.mock.calls.at(-1)?.[0]).toBe("C");
  });

  it("uses full canvas width for full-width band styles", () => {
    const context = createContext(720, 1280);

    drawTextOverlay(
      context,
      createOverlay({
        styleId: "snapchat",
        text: "Bottom caption",
        x: 0.4,
        width: 0.2,
      }),
      2,
    );

    expect(context.moveTo).toHaveBeenCalledWith(0, expect.any(Number));
    expect(context.lineTo).toHaveBeenCalledWith(720, expect.any(Number));
    expect(context.strokeText).not.toHaveBeenCalled();
    expect(context.fillText).toHaveBeenCalledWith(
      expect.any(String),
      360,
      expect.any(Number),
      expect.any(Number),
    );
  });
});
