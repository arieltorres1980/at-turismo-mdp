/**
 * Acceso unico a los datos de contacto.
 *
 * Regla del proyecto: ningun telefono, link de WhatsApp, usuario de Instagram
 * ni email se escribe fuera de `src/data/contact.json`. Todo pasa por aca.
 *
 * Nota: este modulo se importa desde los tests con ruta relativa, asi que no
 * puede usar el alias `@/` (node --test no resuelve jsconfig.json).
 */
import contactData from "../data/contact.json" with { type: "json" };
import { csvUrlDeHoja } from "./sheet-url.js";

export const contact = contactData;

/** `true` si el valor es un string con contenido real. */
export function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

const WA_BASE = "https://wa.me/";

/**
 * Link de WhatsApp. `wa.me` quiere los digitos sin `+` ni separadores.
 * @param {string} [text] mensaje prellenado
 * @param {object} [data] permite inyectar otro contacto (tests)
 */
export function waLink(text, data = contact) {
  const number = data?.whatsapp?.number ?? "";
  const url = `${WA_BASE}${number}`;
  if (!hasValue(text)) return url;
  return `${url}?text=${encodeURIComponent(text)}`;
}

/** `href` para llamar por telefono, o `null` si no hay numero. */
export function telHref(data = contact) {
  const e164 = data?.phone?.e164 ?? "";
  return hasValue(e164) ? `tel:${e164.replace(/[^\d+]/g, "")}` : null;
}

/** URL del perfil de Instagram, o `null` si no hay. */
export function instagramUrl(data = contact) {
  const url = data?.instagram?.url ?? "";
  return hasValue(url) ? url : null;
}

/** `mailto:` o `null`. */
export function emailHref(data = contact) {
  const email = data?.email ?? "";
  return hasValue(email) ? `mailto:${email}` : null;
}

/**
 * Valida el contrato de contact.json. Se llama en el modulo de la pagina para
 * que un JSON mal editado rompa el build y no la produccion.
 * @throws {Error} con un mensaje accionable
 */
export function assertContact(data = contact) {
  const fail = (msg) => {
    throw new Error(`contact.json invalido: ${msg}`);
  };

  if (!data || typeof data !== "object") fail("no es un objeto.");
  if (!hasValue(data.businessName)) fail("falta `businessName`.");

  const number = data.whatsapp?.number;
  if (!hasValue(number)) fail("falta `whatsapp.number`.");
  if (!/^\d{10,15}$/.test(number)) {
    fail(
      "`whatsapp.number` tiene que ser solo digitos (10 a 15), sin `+`, espacios ni guiones. " +
        `Recibido: ${JSON.stringify(number)}.`,
    );
  }

  const siteUrl = data.siteUrl;
  if (!hasValue(siteUrl)) fail("falta `siteUrl`.");
  if (!siteUrl.startsWith("https://")) fail("`siteUrl` tiene que empezar con `https://`.");
  if (siteUrl.endsWith("/")) fail("`siteUrl` no puede terminar con `/`.");

  // `eventsSheet` es opcional: vacio (o ausente) significa "sin Google Sheet",
  // los eventos salen de `src/data/events.json`. Si tiene algo, tiene que ser
  // un link de Google Sheets del que se pueda derivar el CSV; si no, el sitio
  // se quedaria con el fallback sin que nadie se entere.
  const hoja = data.eventsSheet;
  if (hoja !== undefined && typeof hoja !== "string") {
    fail("`eventsSheet` tiene que ser un string (vacio = sin Google Sheet).");
  }
  if (hasValue(hoja)) {
    const derivada = csvUrlDeHoja(hoja);
    if (!derivada.ok) fail(`\`eventsSheet\`: ${derivada.motivo}`);
  }

  return true;
}
