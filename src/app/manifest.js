import { contact } from "@/lib/contact";
import { THEME_COLOR } from "@/lib/seo";

export default function manifest() {
  return {
    name: contact.businessName,
    short_name: contact.shortName,
    description: contact.description,
    lang: contact.locale,
    start_url: "/",
    display: "standalone",
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
