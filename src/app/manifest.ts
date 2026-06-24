import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AEGIS AI Foundation",
    short_name: "AEGIS",
    description: "Decentralized physical AI compute and collective intelligence enclaves network.",
    start_url: "/",
    display: "standalone",
    background_color: "#020408",
    theme_color: "#020408",
    icons: [
      {
        src: "/assets/logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
