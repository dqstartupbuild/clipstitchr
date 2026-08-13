import type {
  StudioClipsCompletionEvidence,
  StudioClipsCompletionEvidenceSnapshot,
} from "./StudioClipsCompletionEvidence";

export function createStudioClipsCompletionEvidence(): StudioClipsCompletionEvidence {
  let state: StudioClipsCompletionEvidenceSnapshot = {
    renders: {},
    storage: {},
  };
  const paths = new Map<string, string>();

  return {
    getAnalysis: () => state.analysis,
    getRender: (artifactId) => {
      const render = state.renders[artifactId];
      return render?.media
        ? { fileName: render.fileName, media: render.media }
        : undefined;
    },
    recordAnalysis: (analysis) => {
      state.analysis = analysis;
    },
    recordProbe: (localPath, media) => {
      const artifactId = paths.get(localPath);
      if (!artifactId) return;
      const render = state.renders[artifactId];
      if (render) render.media = structuredClone(media);
    },
    recordRenderPath: ({ artifactId, fileName, localPath }) => {
      paths.set(localPath, artifactId);
      state.renders[artifactId] = { fileName };
    },
    recordStorageProof: (artifactId, proof) => {
      state.storage[artifactId] = { ...proof };
    },
    restore: (snapshot) => {
      state = structuredClone(snapshot);
    },
    snapshot: () => structuredClone(state),
  };
}
