import type { StudioClipsExecutionAvailability } from "./StudioClipsExecutionAvailability";

export type StudioClipsCapabilities = {
  analysis: {
    message: string;
    state: "available" | "unavailable";
  };
  captionStyle: {
    builtInFonts: Array<{ displayName: string; id: string }>;
    customFontUpload: {
      message: string;
      state: "available" | "unavailable";
    };
    execution: "metadata_only" | "rendered";
    fontSizeOptionsPx: number[];
    templates: Array<{
      description: string;
      fontColorHex: string;
      fontFamily: string;
      fontSizePx: number;
      id: string;
      name: string;
    }>;
  };
  execution: StudioClipsExecutionAvailability;
  handoffs: Record<
    "editor" | "library" | "stitchr",
    { message: string; state: "available" }
  >;
  limitations: string[];
  outputFormats: Array<{
    id: "source" | "split_screen" | "vertical" | "vertical_pan";
    label: string;
    message?: string;
    state: "available" | "unavailable";
  }>;
  outputMetadata: {
    message: string;
    state: "available" | "unavailable";
  };
  platformExports: Array<{
    id: import("./StudioClipsPlatformPreset").StudioClipsPlatformPreset;
    label: string;
    state: "available" | "unavailable";
  }>;
  productId: string;
  schemaVersion: "studio-clips-capabilities-v1";
  sources: {
    upload: {
      state: "available";
      uploadEndpoint: "/api/studio/r2/upload-url";
    };
    youtube: { state: "available" };
  };
  sourceSnapshotVersion: "supoclip-v0_1_0";
};
