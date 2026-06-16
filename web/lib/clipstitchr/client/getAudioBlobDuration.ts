"use client";

const AUDIO_METADATA_TIMEOUT_MS = 7000;

export function getAudioBlobDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.removeAttribute("src");
      audio.load();
      URL.revokeObjectURL(url);
    };
    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve(0);
    }, AUDIO_METADATA_TIMEOUT_MS);

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;

      cleanup();
      resolve(Math.max(0, duration));
    };
    audio.onerror = () => {
      cleanup();
      resolve(0);
    };
    audio.src = url;
  });
}
