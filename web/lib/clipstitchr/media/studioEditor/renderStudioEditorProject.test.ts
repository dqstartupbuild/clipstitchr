import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyStudioEditorCommand } from "@/lib/clipstitchr/studio/editor/applyStudioEditorCommand";
import { createStudioEditorTestFixture } from "@/lib/clipstitchr/studio/editor/test/createStudioEditorTestFixture";
import { renderStudioEditorProject } from "./renderStudioEditorProject";

const mocks = vi.hoisted(() => ({
  addAudio: vi.fn(),
  addVideo: vi.fn(),
  cancel: vi.fn(),
  dispose: vi.fn(),
  draw: vi.fn(),
  finalize: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/media/studioEditor/createStudioEditorRenderResources", () => ({
  createStudioEditorRenderResources: vi.fn(async () => new Map()),
}));
vi.mock("@/lib/clipstitchr/media/studioEditor/disposeStudioEditorRenderResources", () => ({
  disposeStudioEditorRenderResources: mocks.dispose,
}));
vi.mock("@/lib/clipstitchr/media/studioEditor/createStudioEditorAudioBuffer", () => ({
  createStudioEditorAudioBuffer: vi.fn(async () => null),
}));
vi.mock("@/lib/clipstitchr/media/resolveMediaBunnyOutputCodecs", () => ({
  resolveMediaBunnyOutputCodecs: vi.fn(async () => ({ audioCodec: null, videoCodec: "avc" })),
}));
vi.mock("@/lib/clipstitchr/media/studioEditor/createStudioEditorRenderCanvas", () => ({
  createStudioEditorRenderCanvas: vi.fn(() => ({ canvas: {}, context: {} })),
}));
vi.mock("@/lib/clipstitchr/media/studioEditor/drawStudioEditorFrame", () => ({
  drawStudioEditorFrame: mocks.draw,
}));
vi.mock("@/lib/clipstitchr/media/createTikTokCanvasSource", () => ({
  createTikTokCanvasSource: vi.fn(() => ({ add: mocks.addVideo, close: vi.fn() })),
}));
vi.mock("@/lib/clipstitchr/media/createOutputAudioBufferSource", () => ({
  createOutputAudioBufferSource: vi.fn(() => null),
}));
vi.mock("@/lib/clipstitchr/media/createMediaBunnyExportSession", () => ({
  createMediaBunnyExportSession: vi.fn(async ({ audioSource, videoSource }) => ({
    audioSource,
    videoSource,
    output: { cancel: mocks.cancel },
  })),
}));
vi.mock("@/lib/clipstitchr/media/finalizeMediaBunnyExportSession", () => ({
  finalizeMediaBunnyExportSession: mocks.finalize,
}));

describe("renderStudioEditorProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addVideo.mockResolvedValue(undefined);
    mocks.finalize.mockResolvedValue({ blob: new Blob(["mp4"]), mimeType: "video/mp4" });
  });

  it("renders one backpressured canvas sample per project frame", async () => {
    const { project, text } = createStudioEditorTestFixture();
    const oneSecondText = { ...text, durationSeconds: 1 };
    const edited = applyStudioEditorCommand(project, {
      type: "addLayer",
      sceneId: project.activeSceneId,
      trackId: project.scenes[0].tracks[0].id,
      index: 0,
      layer: oneSecondText,
    });

    const result = await renderStudioEditorProject({
      catalog: { videoClips: [], stitches: [] },
      project: edited,
    });

    expect(mocks.draw).toHaveBeenCalledTimes(30);
    expect(mocks.addVideo).toHaveBeenCalledTimes(30);
    expect(mocks.addVideo).toHaveBeenNthCalledWith(1, 0, 1 / 30, { keyFrame: true });
    expect(mocks.finalize).toHaveBeenCalledTimes(1);
    expect(mocks.dispose).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ duration: 1, mimeType: "video/mp4", width: 1080, height: 1920, hasAudio: false });
  });

  it("refuses to export an empty timeline before opening encoders", async () => {
    const { project } = createStudioEditorTestFixture();

    await expect(
      renderStudioEditorProject({ catalog: { videoClips: [], stitches: [] }, project }),
    ).rejects.toThrow("Add something to the timeline");
    expect(mocks.addVideo).not.toHaveBeenCalled();
  });
});
