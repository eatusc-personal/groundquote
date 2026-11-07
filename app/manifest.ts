import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Groundquote: answers you can trace",
    short_name: "Groundquote",
    description:
      "Ask questions about a text document and verify every answer against visible source passages.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8f4",
    theme_color: "#245a42",
    categories: ["productivity", "education", "utilities"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
