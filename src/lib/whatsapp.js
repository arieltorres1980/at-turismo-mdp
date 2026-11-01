/**
 * Armado del mensaje de WhatsApp a partir de la cotizacion.
 * Funciones puras, sin acceso a la fecha actual ni al DOM.
 *
 * Importado por los tests con ruta relativa: nada de alias `@/`.
 */
import { waLink } from "./contact.js";

const text = (value) => (typeof value === "string" ? value.trim() : "");

/** `2026-11-02` -> `02/11/2026`. Sin `Date`, para no romper el prerender. */
export function formatFecha(iso) {
  const raw = text(iso);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const [anio, mes, dia] = raw.split("-");
  return `${dia}/${mes}/${anio}`;
}

/**
 * Arma el texto del mensaje. Las lineas vacias se omiten.
 * @param {object} values valores del formulario (ya validados)
 * @param {{businessName?: string}} [options]
 * @returns {string}
 */
export function buildQuoteMessage(values = {}, options = {}) {
  const nombre = text(values.nombre);
  const negocio = text(options.businessName);

  const saludo = negocio ? `¡Hola ${negocio}!` : "¡Hola!";
  const presentacion = nombre
    ? `${saludo} Soy ${nombre} y quiero cotizar un viaje.`
    : `${saludo} Quiero cotizar un viaje.`;

  const incluyeMenores = values.incluyeMenores === true || values.incluyeMenores === "si";
  const menores = text(values.menores);

  const lineas = [
    ["Origen", text(values.origen)],
    ["Destino", text(values.destino)],
    ["Fecha de salida", formatFecha(values.fechaSalida)],
    ["Fecha de llegada", formatFecha(values.fechaLlegada)],
    ["Horario", text(values.horario)],
    ["Pasajeros", text(values.pasajeros) || (typeof values.pasajeros === "number" ? String(values.pasajeros) : "")],
    ["Menores", incluyeMenores && menores ? menores : ""],
    ["Observaciones", text(values.observaciones)],
    ["Teléfono de contacto", text(values.telefono)],
  ]
    .filter(([, value]) => value.length > 0)
    .map(([label, value]) => `• ${label}: ${value}`);

  return [presentacion, "", ...lineas].join("\n");
}

/**
 * URL completa de WhatsApp para una cotizacion.
 * @param {object} values
 * @param {{businessName?: string, contact?: object}} [options]
 */
export function buildQuoteUrl(values = {}, options = {}) {
  const message = buildQuoteMessage(values, options);
  return options.contact ? waLink(message, options.contact) : waLink(message);
}
