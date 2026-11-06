/**
 * Datos estructurados (E5). Un `@graph` con el negocio y el sitio, derivado de
 * `contact.json`. Regla del contrato: string vacio = la clave no se emite.
 *
 * Que NO se emite, a proposito:
 * - `Review` / `AggregateRating`: Google no admite resenas propias del negocio.
 * - `FAQPage`: Google limito ese rich result a sitios de gobierno y salud.
 * - `priceRange`, `geo`, `hasMap`: no hay dato del cliente.
 * - `Event` por los eventos de "Próximos eventos": Google exige `location` con
 *   un lugar concreto, y la planilla `data/eventos.xlsx` solo pide titulo,
 *   descripcion, dia y hora. Inventar una direccion o poner "Mar del Plata"
 *   como venue seria datos estructurados falsos (y motivo de penalizacion).
 *   Si algun dia la planilla tiene columna de lugar, se agrega aca.
 *
 * Import relativo (sin `@/`) para poder testear con `node --test`.
 */
import { contact as defaultContact, hasValue } from "./contact.js";

/** Tipo schema.org del negocio. D5: `TravelAgency` por default; pasar a `LocalBusiness` si no hay habilitacion. */
export const BUSINESS_TYPE = "TravelAgency";

/** Quita claves con string vacio, arrays vacios, null y undefined. */
function compact(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => {
      if (v == null) return false;
      if (typeof v === "string") return hasValue(v);
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }),
  );
}

/** Ciudades reales: descarta vacios y los marcadores `TODO_CLIENTE`. */
function cleanAreas(areas = []) {
  return areas.filter((a) => hasValue(a) && !a.includes("TODO_CLIENTE"));
}

/**
 * @param {object} [data] contact.json (inyectable para tests)
 * @returns {object} objeto JSON-LD con `@context` y `@graph`
 */
export function buildJsonLd(data = defaultContact) {
  const siteUrl = data.siteUrl;
  const businessId = `${siteUrl}/#business`;
  const websiteId = `${siteUrl}/#website`;

  const addr = data.address ?? {};
  const address = compact({
    "@type": "PostalAddress",
    streetAddress: addr.street,
    addressLocality: addr.locality,
    addressRegion: addr.region,
    postalCode: addr.postalCode,
    addressCountry: addr.country,
  });
  // Solo el @type no es una direccion: si no hay ningun dato real, se omite.
  const hasAddress = Object.keys(address).length > 1;

  const areas = cleanAreas(data.areaServed).map((name) => ({ "@type": "AdministrativeArea", name }));
  const sameAs = [data.instagram?.url].filter(hasValue);

  const business = compact({
    "@type": BUSINESS_TYPE,
    "@id": businessId,
    name: data.businessName,
    alternateName: data.shortName,
    description: data.description,
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    image: `${siteUrl}/opengraph-image.jpg`,
    telephone: data.phone?.e164,
    email: data.email,
    address: hasAddress ? address : undefined,
    areaServed: areas,
    openingHours: data.openingHours,
    sameAs,
  });

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: data.businessName,
    inLanguage: data.locale,
    publisher: { "@id": businessId },
  };

  return { "@context": "https://schema.org", "@graph": [business, website] };
}

/** Serializa para un <script>: escapa `<` (y separadores de linea) para que nada cierre el tag. */
export function serializeJsonLd(obj) {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028")
    .replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");
}
