export type DetectedProject = {
  packageManager: "bun" | "npm" | "pnpm" | "yarn";
  startCommand?: string;
  type: "android" | "electron" | "expo" | "ios" | "react-native" | "web";
};
