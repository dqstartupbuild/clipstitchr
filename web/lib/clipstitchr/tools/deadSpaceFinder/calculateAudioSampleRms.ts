import type { AudioSample } from "mediabunny";

export function calculateAudioSampleRms(sample: AudioSample) {
  const bytesNeeded = sample.allocationSize({ format: "f32", planeIndex: 0 });

  if (bytesNeeded <= 0) return 0;

  const values = new Float32Array(bytesNeeded / 4);
  sample.copyTo(values, { format: "f32", planeIndex: 0 });
  let sumOfSquares = 0;

  for (const value of values) {
    sumOfSquares += value ** 2;
  }

  return values.length ? Math.sqrt(sumOfSquares / values.length) : 0;
}
