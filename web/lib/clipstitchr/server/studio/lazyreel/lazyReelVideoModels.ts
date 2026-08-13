export const lazyReelVideoModels = [
  { id: "seedance", name: "Seedance 2.0", promptGrammar: "For each short shot: framing, subject, one action, environment, natural light, slight handheld camera, quoted dialogue, and 9:16 UGC detail.", notes: ["Keep one action per shot.", "Use a consistent creator reference across clips.", "Avoid film-language effects and over-produced lighting."] },
  { id: "kling", name: "Kling", promptGrammar: "Subject, one action, environment, camera movement, and phone-shot style.", notes: ["Generate one action per clip.", "Use image-to-video from a consistent first frame."] },
  { id: "veo", name: "Veo 3", promptGrammar: "Scene, subject, action, camera, and a quoted native-audio cue.", notes: ["Write native dialogue in quotes.", "Specify the first-three-second beat."] },
  { id: "higgsfield", name: "Higgsfield", promptGrammar: "Subject, one motion preset, environment, and a controlled first frame.", notes: ["Use motion and character references consistently.", "Keep the visual language native and restrained."] },
] as const;
