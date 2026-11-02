import { cacheLife } from "next/cache";

import eventosCommiteados from "../data/events.json" with { type: "json" };
import { contact, hasValue } from "./contact.js";
import { parseCsv } from "./csv.js";
import { filasDesdeCsv, parseEventRows } from "./events-parse.js";
import { csvUrlDeHoja } from "./sheet-url.js";

/**
 * De donde salen los eventos en tiempo de ejecucion.
 *
 * Dos fuentes, en este orden:
 *
 *   1. `contact.json -> eventsSheet`: la Google Sheet del dueño. Se lee del
 *      servidor cada pocos minutos, asi un evento nuevo aparece SIN redeploy.
 *   2. `src/data/events.json`: lo que genero el build desde `data/eventos.xlsx`.
 *      Es el fallback y el unico contenido si no hay hoja configurada.
 *
 * Nada de esto puede romper el sitio: si la hoja no responde, es privada
 * (Google devuelve el HTML del login), tiene una fila mal cargada o esta vacia,
 * se avisa por consola del SERVIDOR y se sigue con `events.json`. Una fila
 * invalida se descarta sola; las demas se publican.
 *
 * Este modulo corre SOLO en el servidor (lo llaman `app/page.js` y
 * `app/layout.js`, que le pasan los eventos a los componentes por props), asi
 * que ni el parser ni la URL de la hoja entran en el bundle del navegador.
 */

/** Cuanto esperamos a Google antes de dar la hoja por caida. */
const TIMEOUT_MS = 8000;

/** Tope defensivo: la seccion muestra tarjetas, no un listado infinito. */
const MAX_EVENTOS = 60;

const log = (mensaje) => {
  // Solo servidor: no hay datos sensibles, es la planilla publica del negocio.
  console.warn(`[eventos] ${mensaje}`);
};

/**
 * URL del CSV a pedir, o `null` si no hay hoja configurada.
 *
 * `EVENTS_SHEET_CSV_URL` es un override para PROBAR en local contra un CSV
 * servido por un servidor de prueba: se usa tal cual, sin pasar por la
 * derivacion de Google. No va en `contact.json` ni se usa en produccion.
 */
function urlCsvActiva() {
  const override = process.env.EVENTS_SHEET_CSV_URL;
  if (hasValue(override)) return override.trim();

  const configurada = contact.eventsSheet;
  if (!hasValue(configurada)) return null;

  const derivada = csvUrlDeHoja(configurada);
  if (!derivada.ok) {
    log(`contact.json -> eventsSheet: ${derivada.motivo} Se usan los eventos de events.json.`);
    return null;
  }
  return derivada.url;
}

/** `true` si lo que volvio es una pagina HTML (hoja privada, error de Google). */
function pareceHtml(tipo, texto) {
  if (/text\/html/i.test(tipo)) return true;
  return /^\s*<(?:!doctype|html|\?xml)/i.test(texto);
}

/**
 * Pide el CSV y lo convierte en eventos.
 * @returns {Promise<Array<object>|null>} `null` si no se pudo usar la hoja
 */
async function leerHoja(url) {
  let texto = "";
  let tipo = "";

  try {
    const respuesta = await fetch(url, {
      headers: { Accept: "text/csv, text/plain, */*" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!respuesta.ok) {
      log(
        `la hoja respondio ${respuesta.status}. Revisá que este compartida como ` +
          '"Cualquier persona con el enlace: Lector".',
      );
      return null;
    }

    tipo = respuesta.headers.get("content-type") ?? "";
    texto = await respuesta.text();
  } catch (error) {
    log(`no pude leer la hoja (${error?.name ?? "error"}: ${error?.message ?? "sin detalle"}).`);
    return null;
  }

  if (pareceHtml(tipo, texto)) {
    log(
      "la hoja devolvio una pagina HTML en vez del CSV: casi siempre es que no " +
        'esta compartida. Ponela en "Cualquier persona con el enlace: Lector".',
    );
    return null;
  }

  const filas = filasDesdeCsv(parseCsv(texto));
  if (filas.length === 0) {
    log("la hoja no tiene ninguna fila de eventos. Se usan los de events.json.");
    return null;
  }

  const { events, errors } = parseEventRows(filas);
  for (const error of errors) log(`fila ignorada. ${error}`);

  if (events.length === 0) {
    log("la hoja no dejo ningun evento publicable. Se usan los de events.json.");
    return null;
  }

  return events.slice(0, MAX_EVENTOS);
}

/**
 * Los eventos de la fuente activa, ya normalizados y ordenados por fecha.
 *
 * `use cache` + `cacheLife` es el ISR de Next 16 (`getStaticProps` con
 * `revalidate` migra justo a esto): la pagina se sigue prerenderizando, y cinco
 * minutos despues de la primera visita Next vuelve a pedir la hoja en segundo
 * plano y regenera el HTML. Por eso cargar un evento en la planilla no necesita
 * redeploy.
 *
 * Los numeros no son libres: con `expire` menor a 5 minutos el resultado queda
 * fuera del prerender y la seccion pasaria a resolverse en cada request.
 *
 * NO filtra los eventos pasados: eso necesita la fecha actual y con
 * `cacheComponents: true` el prerender no puede leerla. Lo hace `Events.jsx` en
 * el cliente.
 *
 * @returns {Promise<Array<object>>}
 */
export async function getEvents() {
  "use cache";
  cacheLife({
    stale: 300, // 5 min en el router del cliente
    revalidate: 300, // 5 min: a partir de ahi se refresca en segundo plano
    expire: 3600, // 1 h sin visitas y la proxima espera el dato fresco
  });

  const url = urlCsvActiva();
  if (!url) return eventosCommiteados;

  const deLaHoja = await leerHoja(url);
  return deLaHoja ?? eventosCommiteados;
}
