/**
 * Parseo y validacion de las filas de `data/eventos.xlsx`.
 *
 * FUNCIONES PURAS: no leen el disco, no leen la fecha actual y no conocen
 * ExcelJS. Reciben los valores crudos de las celdas (string, number, Date o
 * los objetos raros que devuelve ExcelJS) y devuelven eventos normalizados o
 * una lista de errores con el numero de fila.
 *
 * Vive en `scripts/` y no en `src/lib/` a proposito: esto corre solo en el
 * build y no tiene por que entrar en ningun bundle del navegador.
 */

/** Columnas de la hoja `Eventos`, en orden. Las usa tambien el generador de la planilla. */
export const COLUMNAS = ["Título", "Descripción", "Día", "Hora", "Banner", "Activo"];

/** Carpeta (relativa a `public/`) donde van los banners. */
export const CARPETA_BANNERS = "eventos";

/** Extensiones admitidas para el banner. */
export const EXTENSIONES_BANNER = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

export const MAX_TITULO = 120;
export const MAX_DESCRIPCION = 400;

const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Dias del mes, con los bisiestos del calendario gregoriano. */
function diasDelMes(anio, mes) {
  if (mes === 2) {
    const bisiesto = (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
    return bisiesto ? 29 : 28;
  }
  return DIAS_POR_MES[mes - 1];
}

const pad = (n) => String(n).padStart(2, "0");

/**
 * Texto plano de una celda. ExcelJS puede devolver un string, un numero, un
 * `{ richText }` (texto con formato), un `{ formula, result }` o un
 * `{ text, hyperlink }`. Todo eso se aplana aca.
 * @param {unknown} value
 * @returns {string} siempre un string, ya trimmeado
 */
export function cellText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part?.text ?? "").join("").trim();
    }
    if ("text" in value) return cellText(value.text);
    if ("result" in value) return cellText(value.result);
  }
  return "";
}

/**
 * Normaliza el dia a `YYYY-MM-DD`.
 *
 * Admite: celda con formato fecha de Excel (ExcelJS devuelve un `Date` en UTC),
 * el numero de serie de Excel, y texto `DD/MM/AAAA`, `DD-MM-AAAA` o
 * `AAAA-MM-DD`.
 *
 * @param {unknown} value
 * @returns {string|null} `null` si no es una fecha valida
 */
export function parseDia(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    // ExcelJS mapea las celdas fecha a medianoche UTC: se leen las partes UTC
    // para no correr un dia por la zona horaria de quien corre el build.
    return armarISO(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    // Serial de Excel: dia 1 = 1900-01-01, con el bug del 1900 bisiesto, por
    // eso la epoca efectiva es 1899-12-30.
    const dias = Math.floor(value);
    if (dias < 1) return null;
    const fecha = new Date(Date.UTC(1899, 11, 30) + dias * 86400000);
    return armarISO(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, fecha.getUTCDate());
  }

  const raw = cellText(value);
  if (raw.length === 0) return null;

  let m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(raw);
  if (m) return armarISO(Number(m[3]), Number(m[2]), Number(m[1]));

  m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw);
  if (m) return armarISO(Number(m[1]), Number(m[2]), Number(m[3]));

  return null;
}

function armarISO(anio, mes, dia) {
  if (!Number.isInteger(anio) || anio < 1900 || anio > 2999) return null;
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) return null;
  if (!Number.isInteger(dia) || dia < 1 || dia > diasDelMes(anio, mes)) return null;
  return `${anio}-${pad(mes)}-${pad(dia)}`;
}

/**
 * Normaliza la hora a `HH:MM`.
 *
 * Admite: celda con formato hora de Excel (ExcelJS devuelve un `Date` sobre la
 * epoca de Excel), la fraccion de dia (0 a 1) y texto `H:MM`, `HH:MM` o
 * `HH:MM:SS`.
 *
 * @param {unknown} value
 * @returns {string|null|undefined} `undefined` si la celda esta vacia (la hora
 *   es opcional), `null` si tiene algo que no es una hora valida
 */
export function parseHora(value) {
  if (value == null || (typeof value === "string" && value.trim().length === 0)) {
    return undefined;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return `${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}`;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const fraccion = value - Math.floor(value);
    if (value > 1 && fraccion === 0) return null; // es una fecha, no una hora
    const minutos = Math.round(fraccion * 1440) % 1440;
    return `${pad(Math.floor(minutos / 60))}:${pad(minutos % 60)}`;
  }

  const raw = cellText(value);
  const m = /^(\d{1,2}):([0-5]\d)(?::[0-5]\d)?$/.exec(raw);
  if (!m) return null;
  const hora = Number(m[1]);
  if (hora > 23) return null;
  return `${pad(hora)}:${m[2]}`;
}

/**
 * La columna `Activo` es opcional y el default es SI. Solo un `NO` explicito
 * (o `FALSE`) saca la fila de la web: asi la fila de ejemplo puede quedar en la
 * planilla sin publicarse.
 * @param {unknown} value
 */
export function parseActivo(value) {
  const raw = cellText(value).toLowerCase();
  if (raw.length === 0) return true;
  return !["no", "false", "n", "0"].includes(raw);
}

/**
 * Valida la forma del nombre del banner (que exista en disco se chequea aparte).
 * @param {unknown} value
 * @returns {{ok: true, banner?: string}|{ok: false, motivo: string}}
 */
export function parseBanner(value) {
  const raw = cellText(value);
  if (raw.length === 0) return { ok: true };

  if (/[\\/]/.test(raw) || raw.includes("..")) {
    return {
      ok: false,
      motivo: `el banner tiene que ser solo el nombre del archivo (por ejemplo "recital.jpg"), sin carpetas. Recibido: "${raw}".`,
    };
  }

  const punto = raw.lastIndexOf(".");
  const ext = punto === -1 ? "" : raw.slice(punto).toLowerCase();
  if (!EXTENSIONES_BANNER.includes(ext)) {
    return {
      ok: false,
      motivo: `el banner "${raw}" no tiene una extension admitida (${EXTENSIONES_BANNER.join(", ")}).`,
    };
  }

  return { ok: true, banner: raw };
}

/** `true` si la fila esta completamente vacia (hay que ignorarla sin chistar). */
function filaVacia(fila) {
  return ["titulo", "descripcion", "dia", "hora", "banner"].every(
    (clave) => cellText(fila[clave]).length === 0,
  );
}

/**
 * Convierte las filas crudas de la planilla en eventos listos para el JSON.
 *
 * @param {Array<{fila: number, titulo: unknown, descripcion: unknown, dia: unknown, hora: unknown, banner: unknown, activo: unknown}>} filas
 * @param {{bannerExiste?: (nombre: string) => boolean}} [options]
 *   `bannerExiste` se inyecta para no tocar el disco desde las funciones puras.
 * @returns {{events: Array<object>, errors: string[]}}
 */
export function parseEventRows(filas = [], options = {}) {
  const { bannerExiste = () => true } = options;
  const events = [];
  const errors = [];

  for (const fila of filas) {
    const n = fila.fila;
    if (filaVacia(fila)) continue;
    if (!parseActivo(fila.activo)) continue;

    const problemas = [];

    const titulo = cellText(fila.titulo);
    if (titulo.length === 0) {
      problemas.push("falta el Título (es obligatorio).");
    } else if (titulo.length > MAX_TITULO) {
      problemas.push(`el Título supera los ${MAX_TITULO} caracteres (tiene ${titulo.length}).`);
    }

    const descripcion = cellText(fila.descripcion);
    if (descripcion.length === 0) {
      problemas.push("falta la Descripción (es obligatoria).");
    } else if (descripcion.length > MAX_DESCRIPCION) {
      problemas.push(
        `la Descripción supera los ${MAX_DESCRIPCION} caracteres (tiene ${descripcion.length}).`,
      );
    }

    const diaCrudo = cellText(fila.dia);
    const dia = parseDia(fila.dia);
    if (diaCrudo.length === 0) {
      problemas.push("falta el Día (es obligatorio, formato DD/MM/AAAA).");
    } else if (dia === null) {
      problemas.push(`el Día "${diaCrudo}" no es una fecha valida. Usá el formato DD/MM/AAAA.`);
    }

    const hora = parseHora(fila.hora);
    if (hora === null) {
      problemas.push(`la Hora "${cellText(fila.hora)}" no es valida. Usá el formato HH:MM (por ejemplo 21:00).`);
    }

    const banner = parseBanner(fila.banner);
    if (!banner.ok) {
      problemas.push(banner.motivo);
    } else if (banner.banner && !bannerExiste(banner.banner)) {
      problemas.push(
        `el banner "${banner.banner}" no existe en public/${CARPETA_BANNERS}/. Copiá el archivo ahí con ese mismo nombre (respetando mayúsculas) o dejá la celda vacía.`,
      );
    }

    if (problemas.length > 0) {
      for (const problema of problemas) errors.push(`Fila ${n}: ${problema}`);
      continue;
    }

    const evento = { title: titulo, description: descripcion, date: dia };
    if (hora) evento.time = hora;
    if (banner.banner) evento.banner = banner.banner;
    events.push(evento);
  }

  events.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    const ha = a.time ?? "";
    const hb = b.time ?? "";
    if (ha !== hb) return ha < hb ? -1 : 1;
    return a.title.localeCompare(b.title, "es-AR");
  });

  return { events, errors };
}
