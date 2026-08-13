import type { StudioClipsBuiltInFont } from "./StudioClipsBuiltInFont";

const fonts = {
  "Anton-Regular": { family: "Anton", fileName: "Anton-Regular.ttf" },
  "ArchivoBlack-Regular": {
    family: "Archivo Black",
    fileName: "ArchivoBlack-Regular.ttf",
  },
  "Bangers-Regular": { family: "Bangers", fileName: "Bangers-Regular.ttf" },
  "BarlowCondensed-Bold": {
    family: "Barlow Condensed",
    fileName: "BarlowCondensed-Bold.ttf",
  },
  "BebasNeue-Regular": {
    family: "Bebas Neue",
    fileName: "BebasNeue-Regular.ttf",
  },
  DMSans: { family: "DM Sans", fileName: "DMSans.ttf" },
  Inter: { family: "Inter", fileName: "Inter.ttf" },
  LeagueSpartan: { family: "League Spartan", fileName: "LeagueSpartan.ttf" },
  "Montserrat-Variable-wght": {
    family: "Montserrat",
    fileName: "Montserrat-Variable-wght.ttf",
  },
  NunitoSans: { family: "Nunito Sans", fileName: "NunitoSans.ttf" },
  OpenSans: { family: "Open Sans", fileName: "OpenSans.ttf" },
  "Oswald-Variable-wght": {
    family: "Oswald",
    fileName: "Oswald-Variable-wght.ttf",
  },
  "Poppins-ExtraBold": {
    family: "Poppins",
    fileName: "Poppins-ExtraBold.ttf",
  },
  "Raleway-Variable-wght": {
    family: "Raleway",
    fileName: "Raleway-Variable-wght.ttf",
  },
  Roboto: { family: "Roboto", fileName: "Roboto.ttf" },
  Rubik: { family: "Rubik", fileName: "Rubik.ttf" },
  Sora: { family: "Sora", fileName: "Sora.ttf" },
  THEBOLDFONT: {
    family: "THE BOLD FONT (FREE VERSION)",
    fileName: "THEBOLDFONT.ttf",
  },
  "TikTokSans-Regular": {
    family: "TikTok Sans",
    fileName: "TikTokSans-Regular.ttf",
  },
  Urbanist: { family: "Urbanist", fileName: "Urbanist.ttf" },
  WorkSans: { family: "Work Sans", fileName: "WorkSans.ttf" },
} as const satisfies Record<string, StudioClipsBuiltInFont>;

export function getStudioClipsBuiltInFont(
  fontId: string,
): StudioClipsBuiltInFont | undefined {
  return fonts[fontId as keyof typeof fonts];
}
