/**
 * Armado del mensaje de WhatsApp a partir de la cotizacion.
 * Funciones puras, sin acceso a la fecha actual ni al DOM.
 *
 * Importado por los tests con ruta relativa: nada de alias `@/`.
 */
import { waLink } from "./contact.js";
import { formatearFechaEvento } from "./events.js";

const text = (value) => (typeof value === "string" ? value.trim() : "");

/** `[["Origen", "Colon 1234"]]` -> `["• Origen: Colon 1234"]`, salteando lo vacio. */
function vinetas(pares) {
  return pares
    .filter(([, value]) => typeof value === "string" && value.length > 0)
    .map(([label, value]) => `• ${label}: ${value}`);
}

/** `¡Hola AT Turismo y Traslados!` o `¡Hola!` si no hay nombre de negocio. */
function saludo(businessName) {
  const negocio = text(businessName);
  return negocio ? `¡Hola ${negocio}!` : "¡Hola!";
}

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
  const hola = saludo(options.businessName);
  const presentacion = nombre
    ? `${hola} Soy ${nombre} y quiero cotizar un viaje.`
    : `${hola} Quiero cotizar un viaje.`;

  const incluyeMenores = values.incluyeMenores === true || values.incluyeMenores === "si";
  const menores = text(values.menores);

  const lineas = vinetas([
    ["Origen", text(values.origen)],
    ["Destino", text(values.destino)],
    ["Fecha de salida", formatFecha(values.fechaSalida)],
    ["Fecha de llegada", formatFecha(values.fechaLlegada)],
    ["Horario", text(values.horario)],
    ["Pasajeros", text(values.pasajeros) || (typeof values.pasajeros === "number" ? String(values.pasajeros) : "")],
    ["Menores", incluyeMenores && menores ? menores : ""],
    ["Observaciones", text(values.observaciones)],
    ["Teléfono de contacto", text(values.telefono)],
  ]);

  return [presentacion, "", ...lineas].join("\n");
}

/**
 * Mensaje del boton "Consultar por este evento" de una tarjeta de evento.
 *
 * Es un link `wa.me` comun, resuelto en el servidor: funciona sin JavaScript y
 * no necesita arrastrar el evento hasta el formulario. Lleva el titulo y la
 * fecha (y la hora, si la hay) para que del otro lado se sepa de que evento se
 * trata, y pide los datos del viaje que el formulario preguntaria.
 *
 * Por que NO se mete el evento como una linea mas del mensaje del formulario:
 * el presupuesto de la URL de `wa.me` (2000 caracteres) ya esta practicamente
 * saturado por los topes de los campos libres — la cota superior del caso peor
 * da 1965 caracteres (ver `tests/quote.test.mjs`). Una linea de evento mas
 * reventaria esa garantia, asi que la consulta por evento viaja en su propio
 * mensaje, que es corto y acotado.
 *
 * @param {{title?: string, date?: string, time?: string}} evento
 * @param {{businessName?: string}} [options]
 * @returns {string}
 */
export function buildEventMessage(evento = {}, options = {}) {
  const titulo = text(evento.title);
  const presentacion = `${saludo(options.businessName)} Quiero consultar por un traslado para este evento:`;

  const lineas = vinetas([
    ["Evento", titulo],
    ["Día", formatearFechaEvento(text(evento.date))],
    ["Hora", text(evento.time)],
  ]);

  return [presentacion, "", ...lineas, "", "¿Me pasan precio? Les cuento desde dónde salimos y cuántos somos."].join(
    "\n",
  );
}

/**
 * URL completa de WhatsApp para la consulta de un evento.
 * @param {object} evento
 * @param {{businessName?: string, contact?: object}} [options]
 */
export function buildEventUrl(evento = {}, options = {}) {
  const message = buildEventMessage(evento, options);
  return options.contact ? waLink(message, options.contact) : waLink(message);
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
