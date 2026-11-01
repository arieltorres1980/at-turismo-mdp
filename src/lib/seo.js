/**
 * Metadata y viewport del sitio (E1). Todo deriva de `src/data/contact.json`.
 * `layout.js` solo re-exporta `metadata` y `viewport` (T5).
 *
 * Los archivos `icon.png`, `apple-icon.png` y `opengraph-image.jpg` de `src/app`
 * los enlaza Next automaticamente (file convention), por eso no se repiten aca.
 *
 * Import relativo (sin `@/`) para poder testear con `node --test`.
 */
import { contact } from "./contact.js";

/** Color de la barra del navegador: el negro del logo (`--color-brand-black`). */
export const THEME_COLOR = "#050608";

/** `es-AR` -> `es_AR` (formato de og:locale). */
const ogLocale = contact.locale.replace("-", "_");

const defaultTitle = `${contact.businessName} — ${contact.tagline}`;

export const metadata = {
  metadataBase: new URL(contact.siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${contact.businessName}`,
  },
  description: contact.description,
  applicationName: contact.businessName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: ogLocale,
    siteName: contact.businessName,
    title: defaultTitle,
    description: contact.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: contact.description,
  },
  robots: { index: true, follow: true },
  // Evita que iOS convierta cualquier numero en link; el telefono ya es un <a tel:> explicito.
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: THEME_COLOR,
};
