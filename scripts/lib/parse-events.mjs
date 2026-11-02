/**
 * Parseo y validacion de `data/eventos.xlsx`.
 *
 * La implementacion se mudo a `src/lib/events-parse.js` cuando se sumo la
 * Google Sheet como segunda fuente: el servidor necesita la MISMA validacion
 * que el build del .xlsx y no puede importar nada de `scripts/`.
 *
 * Este archivo queda como punto de entrada de `scripts/` (lo usan
 * `build-events.mjs`, `make-events-template.mjs` y `tests/events-parse.test.mjs`)
 * para no cambiar sus imports. No agrega logica.
 */
export {
  CARPETA_BANNERS,
  CLAVES,
  COLUMNAS,
  EXTENSIONES_BANNER,
  MAX_DESCRIPCION,
  MAX_TITULO,
  cellText,
  filasDesdeCsv,
  parseActivo,
  parseBanner,
  parseDia,
  parseEventRows,
  parseHora,
} from "../../src/lib/events-parse.js";
