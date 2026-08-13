export type StudioClipsOutputHandoff = {
  destination: "editor" | "library" | "stitchr";
  state: "cleared" | "requested";
  updatedAt: string;
};
