import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Pak Multilinks Hygiene", short_name: "Pak Multilinks", description: "Wholesale tissue and hygiene supplies by carton in Lahore.", start_url: "/", scope: "/", display: "standalone", background_color: "#fbfaf5", theme_color: "#114b2f", categories: ["business", "shopping"], icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }, { src: "/apple-icon", sizes: "180x180", type: "image/png" }] };
}
