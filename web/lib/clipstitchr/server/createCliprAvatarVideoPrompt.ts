export function createCliprAvatarVideoPrompt() {
  return [
    "Animate the provided photo as one continuous, realistic talking-head video of the person reading the voice script.",
    "Use the photo as the complete visual reference for the person, outfit, background, lighting, camera angle, framing, and scene.",
    "Preserve the photographed environment exactly as the video setting.",
    "Keep a clean real-world camera frame with the person as the sole subject.",
    "Keep the camera locked in the original framing.",
    "Add subtle natural lip sync with small mouth, face, head, shoulder, and hand motion.",
  ].join("\n");
}
