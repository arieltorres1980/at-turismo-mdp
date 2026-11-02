/**
 * Hosts admitidos para un banner de evento cargado como URL.
 *
 * Cuando los eventos salen de una Google Sheet, el dueño no puede copiar un
 * archivo a `public/eventos/`: lo mas natural es que suba la imagen al mismo
 * Drive donde esta la planilla y pegue el link. Como `next/image` solo
 * optimiza hosts declarados en `images.remotePatterns`, los patrones y la
 * validacion del parser viven en el MISMO archivo para que no se desincronicen:
 * `next.config.mjs` importa `PATRONES_BANNER_REMOTO` y el parser usa
 * `normalizarBannerRemoto`. Hay un test que verifica que coincidan.
 *
 * Formas de link que acepta (todas son de una imagen compartida en Drive):
 *
 *   https://lh3.googleusercontent.com/d/<ID>          <- la mas directa
 *   https://drive.google.com/uc?export=view&id=<ID>
 *   https://drive.google.com/file/d/<ID>/view?usp=sharing  <- lo que copia Drive
 *
 * La tercera es la que el dueño va a tener en el portapapeles y NO es una
 * imagen (es una pagina HTML), asi que se reescribe a la primera.
 *
 * Funciones PURAS. Importadas por los tests con ruta relativa: nada de `@/`.
 */

const LH3 = "https://lh3.googleusercontent.com/d/";

/**
 * Para `images.remotePatterns` de `next.config.mjs`.
 *
 * `search: ""` exige que la URL no tenga query string: el optimizador rechaza
 * cualquier otra cosa. La excepcion es `drive.google.com/uc`, donde el `id` del
 * archivo viaja justamente en la query, asi que ahi se acota por `pathname`.
 */
export const PATRONES_BANNER_REMOTO = [
  { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**", search: "" },
  { protocol: "https", hostname: "**.googleusercontent.com", pathname: "/**", search: "" },
  { protocol: "https", hostname: "drive.google.com", pathname: "/uc" },
];

const noSirve = (motivo) => ({ ok: false, motivo });

const AYUDA =
  'tiene que ser el nombre de un archivo de public/eventos/ (por ejemplo "recital.jpg") ' +
  "o el link de una imagen de Google Drive (https://drive.google.com/file/d/<ID>/view).";

/** ID de archivo de Drive dentro de `/file/d/<ID>/...`. */
const RE_FILE = /^\/file\/d\/([\w-]+)(?:\/.*)?$/;

/**
 * Valida y normaliza una URL de banner.
 *
 * @param {string} raw lo que escribieron en la columna Banner
 * @returns {{ok: true, url: string}|{ok: false, motivo: string}}
 */
export function normalizarBannerRemoto(raw) {
  let url;
  try {
    url = new URL(String(raw).trim());
  } catch {
    return noSirve(`el banner "${raw}" no es una URL valida: ${AYUDA}`);
  }

  if (url.protocol !== "https:") {
    return noSirve(`el banner "${raw}" tiene que ser https:// (no http://).`);
  }

  if (url.hostname === "drive.google.com") {
    const archivo = RE_FILE.exec(url.pathname);
    if (archivo) return { ok: true, url: `${LH3}${archivo[1]}` };

    const id = url.searchParams.get("id");
    if ((url.pathname === "/uc" || url.pathname === "/open") && id && /^[\w-]+$/.test(id)) {
      // `/open` no sirve imagenes: se manda a la forma directa.
      return url.pathname === "/uc"
        ? { ok: true, url: `https://drive.google.com/uc?export=view&id=${id}` }
        : { ok: true, url: `${LH3}${id}` };
    }

    return noSirve(
      `el banner "${raw}" es un link de Drive que no apunta a un archivo. ` +
        "Usá el que da Compartir sobre la imagen (.../file/d/<ID>/view).",
    );
  }

  if (url.hostname.endsWith(".googleusercontent.com")) {
    // La query (`?usp=sharing` y compañia) rompe el optimizador y no aporta
    // nada: se descarta.
    return { ok: true, url: `${url.origin}${url.pathname}` };
  }

  return noSirve(
    `el banner "${raw}" esta en un dominio no habilitado (${url.hostname}). Por seguridad ` +
      "solo se permiten imagenes de Google Drive: " +
      AYUDA,
  );
}
