/**
 * Apertura de una URL externa en una pestana nueva, con deteccion fiable de
 * popup bloqueado.
 *
 * El `window.open(url, "_blank", "noopener")` de antes NO servia para detectar
 * nada: cuando `noopener` esta en el string de features, la especificacion
 * obliga a devolver `null` SIEMPRE, abra o no la pestana. El fallback del
 * formulario quedaba visible en todos los casos.
 *
 * Asi que se abre sin features y se corta la referencia a mano
 * (`ventana.opener = null`), que deja el mismo aislamiento y ademas permite
 * distinguir "bloqueado" (`null`) de "abierto" (objeto ventana).
 *
 * `open` se inyecta para poder testear sin DOM. Importado por los tests con
 * ruta relativa: nada de alias `@/`.
 */

/** @returns {Function|null} */
function openDelNavegador() {
  return typeof window !== "undefined" && typeof window.open === "function"
    ? window.open.bind(window)
    : null;
}

/**
 * Abre `url` en una pestana nueva.
 * @param {string} url
 * @param {Function} [open] por defecto, `window.open`
 * @returns {boolean} `true` si la pestana se abrio; `false` si la bloquearon
 *   (o si no hay forma de abrirla), unico caso en el que corresponde mostrar
 *   el enlace de fallback.
 */
export function openExternal(url, open = openDelNavegador()) {
  if (typeof open !== "function" || typeof url !== "string" || url.length === 0) {
    return false;
  }

  let ventana = null;
  try {
    ventana = open(url, "_blank");
  } catch {
    return false;
  }

  if (!ventana) return false;

  try {
    // Mismo efecto que `noopener`, sin perder el valor de retorno.
    ventana.opener = null;
  } catch {
    // Algun navegador puede no dejar escribir `opener`: la pestana ya se abrio
    // igual, y desde 2021 `target="_blank"` implica `noopener` por defecto.
  }

  return true;
}
