/**
 * Parser de CSV, sin dependencias.
 *
 * Existe porque los eventos pueden venir de una Google Sheet exportada como
 * CSV y `exceljs` es devDependency: no puede entrar en `src/`.
 *
 * Cubre lo que realmente exporta Google Sheets:
 *   - BOM UTF-8 al principio del archivo;
 *   - campos entre comillas dobles, con comas, saltos de linea y comillas
 *     escapadas como `""` adentro;
 *   - fin de linea `\n`, `\r\n` o `\r`.
 *
 * Funcion PURA: no toca la red ni el disco ni el reloj. Importada por los tests
 * con ruta relativa, asi que nada de alias `@/`.
 */

/** `true` si la fila es una linea vacia (no una fila con celdas vacias). */
function lineaVacia(fila) {
  return fila.length === 1 && fila[0].length === 0;
}

/**
 * Convierte el texto de un CSV en una matriz de strings.
 *
 * No interpreta encabezados ni tipos: devuelve exactamente el texto de cada
 * celda, sin trimmear (eso lo hace despues `cellText`).
 *
 * @param {unknown} texto contenido del archivo
 * @returns {string[][]} una fila por linea; `[]` si no hay nada que leer
 */
export function parseCsv(texto) {
  if (typeof texto !== "string" || texto.length === 0) return [];

  // BOM UTF-8: Google Sheets lo agrega en el export. Si no se saca, el primer
  // encabezado queda como "﻿Título" y no matchea.
  const src = texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto;

  const filas = [];
  let fila = [];
  let campo = "";
  let enComillas = false;

  const cerrarCampo = () => {
    fila.push(campo);
    campo = "";
  };
  const cerrarFila = () => {
    cerrarCampo();
    if (!lineaVacia(fila)) filas.push(fila);
    fila = [];
  };

  for (let i = 0; i < src.length; i += 1) {
    const c = src[i];

    if (enComillas) {
      if (c !== '"') {
        campo += c;
      } else if (src[i + 1] === '"') {
        campo += '"';
        i += 1; // la comilla escapada consume dos caracteres
      } else {
        enComillas = false;
      }
      continue;
    }

    if (c === '"') {
      enComillas = true;
    } else if (c === ",") {
      cerrarCampo();
    } else if (c === "\n") {
      cerrarFila();
    } else if (c === "\r") {
      if (src[i + 1] === "\n") i += 1; // CRLF cuenta como un solo fin de linea
      cerrarFila();
    } else {
      campo += c;
    }
  }

  // Ultima linea sin salto de linea final.
  if (campo.length > 0 || fila.length > 0) cerrarFila();

  return filas;
}
