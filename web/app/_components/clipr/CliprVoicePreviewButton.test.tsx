import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CliprVoicePreviewButton } from "@/app/_components/clipr/CliprVoicePreviewButton";

describe("CliprVoicePreviewButton", () => {
  it("renders the full preview button label", () => {
    const markup = renderToStaticMarkup(
      <CliprVoicePreviewButton src="/voice.mp3" voiceName="Zephyr" />,
    );

    expect(markup).toContain('aria-label="Preview Zephyr voice"');
    expect(markup).toContain("Preview");
  });

  it("renders compact and disabled preview states", () => {
    const markup = renderToStaticMarkup(
      <CliprVoicePreviewButton
        disabled
        isCompact
        src="/voice.mp3"
        voiceName="Zephyr"
      />,
    );

    expect(markup).toContain('aria-label="Preview Zephyr voice"');
    expect(markup).toContain("disabled");
    expect(markup).not.toContain(">Preview<");
  });
});
