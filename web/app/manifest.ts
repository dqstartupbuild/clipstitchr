import type { MetadataRoute } from "next";
import { brandAssets } from "@/lib/brandAssets";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#100e0d",
    theme_color: "#ad7659",
    icons: [
      {
        src: brandAssets.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: brandAssets.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: brandAssets.maskableIcon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: brandAssets.maskableIcon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
