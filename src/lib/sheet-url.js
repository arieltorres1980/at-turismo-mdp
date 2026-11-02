/**
 * De la URL que el dueño copia del navegador a la URL que devuelve el CSV.
 *
 * El dueño del negocio no tiene por que saber que es un "export CSV": pega en
 * `contact.json -> eventsSheet` el link que tiene a mano y esto deriva la URL
 * que hay que pedir. Se aceptan las dos formas que entrega Google:
 *
 *   1. El link normal de la hoja (Compartir -> Copiar vinculo):
 *      https://docs.google.com/spreadsheets/d/<ID>/edit?gid=123#gid=123
 *      -> https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=123
 *
 *   2. El link de Archivo -> Compartir -> Publicar en la web:
 *      https://docs.google.com/spreadsheets/d/e/<KEY>/pubhtml?gid=123&single=true
 *      https://docs.google.com/spreadsheets/d/e/<KEY>/pub?output=csv
 *      -> https://docs.google.com/spreadsheets/d/e/<KEY>/pub?output=csv&gid=123&single=true
 *
 * `gid` es la pestaña: si no viene en el link, se usa `0` (la primera).
 *
 * Funciones PURAS: no tocan la red. Importadas por los tests con ruta
 * relativa, asi que nada de alias `@/`.
 */

const BASE = "https://docs.google.com/spreadsheets";
const HOST = "docs.google.com";

/** `/spreadsheets/d/e/<KEY>/pub...` — hoja publicada en la web. */
const RE_PUBLICADA = /^\/spreadsheets\/d\/e\/([\w-]+)(?:\/(?:pub|pubhtml|pubhtm|pubchart))?\/?$/;

/** `/spreadsheets/d/<ID>/...` (con el `/u/0/` opcional que mete Google). */
const RE_HOJA = /^\/spreadsheets(?:\/u\/\d+)?\/d\/([\w-]+)(?:\/.*)?$/;

/**
 * La pestaña, de `?gid=123` o de `#gid=123`.
 * @returns {string|null}
 */
function leerGid(url) {
  const deQuery = url.searchParams.get("gid");
  if (deQuery && /^\d+$/.test(deQuery)) return deQuery;

  const deHash = /(?:^#|[#&])gid=(\d+)/.exec(url.hash);
  return deHash ? deHash[1] : null;
}

const noSirve = (motivo) => ({ ok: false, motivo });

/**
 * URL del CSV a partir de cualquier link de Google Sheets.
 *
 * @param {unknown} valor el contenido de `contact.eventsSheet`
 * @returns {{ok: true, url: string, tipo: "export"|"publicada"}|{ok: false, motivo: string}}
 */
export function csvUrlDeHoja(valor) {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    return noSirve("esta vacio (sin hoja configurada se usan los eventos de la planilla).");
  }

  const raw = valor.trim();
  let url;
  try {
    url = new URL(raw);
  } catch {
    return noSirve(`"${raw}" no es una URL. Pega el link completo, empezando con https://.`);
  }

  if (url.protocol !== "https:") {
    return noSirve("la URL de la hoja tiene que empezar con https://.");
  }
  if (url.hostname !== HOST) {
    return noSirve(
      `la URL tiene que ser de ${HOST} (una Google Sheet). Recibido: "${url.hostname}".`,
    );
  }

  const gid = leerGid(url);

  const publicada = RE_PUBLICADA.exec(url.pathname);
  if (publicada) {
    const extra = gid ? `&gid=${gid}&single=true` : "";
    return { ok: true, tipo: "publicada", url: `${BASE}/d/e/${publicada[1]}/pub?output=csv${extra}` };
  }

  const hoja = RE_HOJA.exec(url.pathname);
  if (hoja) {
    return { ok: true, tipo: "export", url: `${BASE}/d/${hoja[1]}/export?format=csv&gid=${gid ?? "0"}` };
  }

  return noSirve(
    `no reconozco la URL "${raw}". Tiene que ser el link de la hoja ` +
      "(.../spreadsheets/d/<ID>/edit...) o el de publicar en la web (.../spreadsheets/d/e/<CLAVE>/pub...).",
  );
}
