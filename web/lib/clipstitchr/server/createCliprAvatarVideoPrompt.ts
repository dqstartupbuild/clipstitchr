export function createCliprAvatarVideoPrompt() {
  return [
    "Animate the provided photo as a talking avatar reading the voice script.",
    "Use the photo as the full visual reference.",
    "Do not change the person, outfit, background, lighting, camera angle, framing, or scene.",
    "Do not add new background details, props, cuts, b-roll, captions, subtitles, logos, app screens, readable UI, or graphic overlays.",
    "Keep the camera locked and only add subtle natural mouth, face, head, shoulder, and small hand motion for lip sync.",
  ].join("\n");
}
