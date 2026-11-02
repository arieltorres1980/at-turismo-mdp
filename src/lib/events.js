/**
 * Eventos en la web: filtrado de los que ya pasaron y formato de fecha.
 *
 * Los datos salen de `src/data/events.json`, que lo genera
 * `scripts/build-events.mjs` a partir de `data/eventos.xlsx`.
 *
 * Funciones PURAS: `hoy` entra como parametro (igual que en `validateQuote`).
 * Con `cacheComponents: true` un `new Date()` durante el prerender rompe el
 * build, asi que la fecha actual la aporta el cliente (ver `hoyISO`).
 *
 * Importado por los tests con ruta relativa: nada de alias `@/`.
 */

/**
 * Fecha local de HOY en `YYYY-MM-DD`.
 *
 * Lee el reloj, asi que SOLO puede llamarse desde el cliente (via
 * `useClientValue`), nunca durante el render del servidor.
 * @returns {string}
 */
export function hoyISO() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

/**
 * Eventos que todavia no pasaron. El evento del dia de hoy se sigue mostrando
 * (aunque la hora ya haya pasado): es preferible mostrarlo de mas que esconder
 * algo que puede seguir estando vigente.
 *
 * @param {Array<{date: string}>} events ya ordenados por fecha
 * @param {string} hoy `YYYY-MM-DD`
 * @returns {Array<object>}
 */
export function proximosEventos(events = [], hoy = "") {
  if (!Array.isArray(events)) return [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hoy)) return events;
  return events.filter((evento) => typeof evento?.date === "string" && evento.date >= hoy);
}

const FORMATO_LARGO = { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" };

/**
 * `2026-11-14` -> `sábado 14 de noviembre`.
 *
 * Se construye la fecha en UTC y se formatea en UTC: asi el resultado no
 * depende de la zona horaria de quien renderiza, y no se lee el reloj.
 *
 * No incluye el año a proposito: la seccion solo muestra eventos proximos.
 *
 * @param {string} iso `YYYY-MM-DD`
 * @returns {string} el ISO tal cual si no se puede formatear
 */
export function formatearFechaEvento(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso ?? "";
  const [anio, mes, dia] = iso.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  if (Number.isNaN(fecha.getTime())) return iso;
  // `format()` en es-AR mete una coma despues del dia de la semana
  // ("sábado, 14 de noviembre"). Se arma desde las partes para sacarla.
  return new Intl.DateTimeFormat("es-AR", FORMATO_LARGO)
    .formatToParts(fecha)
    .map((parte) => (parte.type === "literal" ? parte.value.replace(/,/g, "") : parte.value))
    .join("")
    .trim();
}

/** `2026-11-14` + `21:00` -> `2026-11-14T21:00` (para el `dateTime` del <time>). */
export function dateTimeAttr(evento = {}) {
  const fecha = typeof evento.date === "string" ? evento.date : "";
  return evento.time ? `${fecha}T${evento.time}` : fecha;
}
