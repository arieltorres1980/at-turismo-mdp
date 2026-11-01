import { buildJsonLd, serializeJsonLd } from "@/lib/jsonld";

/** Emite el JSON-LD de la landing. Server Component: va en el HTML inicial. */
export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildJsonLd()) }}
    />
  );
}
