/**
 * Validacion del formulario de cotizacion.
 *
 * Funciones PURAS: `today` entra como parametro y nunca se calcula adentro.
 * Es intencional: con `cacheComponents: true` un `new Date()` durante el
 * prerender rompe el build, y ademas asi se puede testear.
 *
 * Importado por los tests con ruta relativa: nada de alias `@/`.
 */

export const MAX_OBSERVACIONES = 500;
export const MAX_TEXTO_CORTO = 120;
export const MAX_NOMBRE = 80;
export const DEFAULT_MAX_PASAJEROS = 20;

/**
 * Tope de bytes percent-encoded por campo de texto libre.
 * Motivo (R6 del PLAN): `wa.me` recibe el mensaje en la query string y se
 * busca dejar la URL final por debajo de 2000 caracteres. Un caracter latino
 * acentuado ocupa 6 caracteres al codificarse (`á` -> `%C3%A1`), asi que 500
 * caracteres podrian convertirse en 3000. Un texto en castellano normal de
 * 500 caracteres ronda los 540 codificados: nadie choca con este tope
 * escribiendo de verdad, pero la cota queda garantizada.
 */
export const MAX_OBSERVACIONES_CODIFICADAS = 900;
export const MAX_TEXTO_CORTO_CODIFICADO = 180;

/** Orden en el que se muestran los errores en el resumen (= orden del form). */
export const FIELD_ORDER = [
  "origen",
  "destino",
  "fechaSalida",
  "fechaLlegada",
  "horario",
  "pasajeros",
  "incluyeMenores",
  "menores",
  "observaciones",
  "nombre",
  "telefono",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const text = (value) => (typeof value === "string" ? value.trim() : "");

const MSG_MUY_LARGO = "Es muy largo para enviarlo por WhatsApp. Acortalo un poco, por favor.";

/** `true` si el texto entra en el presupuesto de la URL de WhatsApp. */
function excedeCodificado(value, max) {
  return encodeURIComponent(value).length > max;
}

function parseEntero(value) {
  const raw = typeof value === "number" ? String(value) : text(value);
  if (!/^\d+$/.test(raw)) return null;
  return Number.parseInt(raw, 10);
}

/** Cuenta los digitos de un telefono, ignorando `+ - ( )` y espacios. */
export function digitosTelefono(value) {
  const raw = text(value);
  if (raw.length === 0) return 0;
  if (/[^\d+\-()\s]/.test(raw)) return -1; // caracter no permitido
  return raw.replace(/\D/g, "").length;
}

/**
 * @param {object} values valores crudos del formulario
 * @param {{today: string, maxPasajeros?: number}} options `today` en `YYYY-MM-DD`
 * @returns {{valid: boolean, errors: Record<string,string>, fields: string[]}}
 */
export function validateQuote(values = {}, options = {}) {
  const { today, maxPasajeros = DEFAULT_MAX_PASAJEROS } = options;
  const errors = {};

  const origen = text(values.origen);
  if (origen.length === 0) {
    errors.origen = "Decinos desde dónde salís.";
  } else if (origen.length > MAX_TEXTO_CORTO || excedeCodificado(origen, MAX_TEXTO_CORTO_CODIFICADO)) {
    errors.origen = MSG_MUY_LARGO;
  }

  const destino = text(values.destino);
  if (destino.length === 0) {
    errors.destino = "Decinos adónde vas.";
  } else if (destino.length > MAX_TEXTO_CORTO || excedeCodificado(destino, MAX_TEXTO_CORTO_CODIFICADO)) {
    errors.destino = MSG_MUY_LARGO;
  }

  const fechaSalida = text(values.fechaSalida);
  if (fechaSalida.length === 0) {
    errors.fechaSalida = "Elegí la fecha de salida.";
  } else if (!ISO_DATE.test(fechaSalida)) {
    errors.fechaSalida = "La fecha de salida no tiene un formato válido.";
  } else if (ISO_DATE.test(text(today)) && fechaSalida < text(today)) {
    errors.fechaSalida = "La fecha de salida no puede ser anterior a hoy.";
  }

  const fechaLlegada = text(values.fechaLlegada);
  if (fechaLlegada.length > 0) {
    if (!ISO_DATE.test(fechaLlegada)) {
      errors.fechaLlegada = "La fecha de llegada no tiene un formato válido.";
    } else if (ISO_DATE.test(fechaSalida) && fechaLlegada < fechaSalida) {
      errors.fechaLlegada = "La fecha de llegada no puede ser anterior a la de salida.";
    }
  }

  const horario = text(values.horario);
  if (horario.length === 0) {
    errors.horario = "Elegí el horario de salida.";
  } else if (!TIME.test(horario)) {
    errors.horario = "El horario no tiene un formato válido.";
  }

  const pasajeros = parseEntero(values.pasajeros);
  if (text(values.pasajeros).length === 0 && values.pasajeros !== 0) {
    errors.pasajeros = "Indicá cuántas personas viajan.";
  } else if (pasajeros === null) {
    errors.pasajeros = "La cantidad de pasajeros tiene que ser un número entero.";
  } else if (pasajeros < 1) {
    errors.pasajeros = "Tiene que viajar al menos una persona.";
  } else if (pasajeros > maxPasajeros) {
    errors.pasajeros = `Para más de ${maxPasajeros} pasajeros, escribinos directamente por WhatsApp.`;
  }

  const incluyeMenores = values.incluyeMenores === true || values.incluyeMenores === "si";
  if (incluyeMenores) {
    const menores = parseEntero(values.menores);
    if (text(values.menores).length === 0 && values.menores !== 0) {
      errors.menores = "Indicá cuántos menores viajan.";
    } else if (menores === null) {
      errors.menores = "La cantidad de menores tiene que ser un número entero.";
    } else if (menores < 1) {
      errors.menores = "Si viajan menores, tiene que haber al menos uno.";
    } else if (pasajeros !== null && menores > pasajeros) {
      errors.menores = "Los menores no pueden ser más que el total de pasajeros.";
    }
  }

  const observaciones = text(values.observaciones);
  if (observaciones.length > MAX_OBSERVACIONES) {
    errors.observaciones = `Las observaciones no pueden superar los ${MAX_OBSERVACIONES} caracteres.`;
  } else if (excedeCodificado(observaciones, MAX_OBSERVACIONES_CODIFICADAS)) {
    errors.observaciones = MSG_MUY_LARGO;
  }

  const nombre = text(values.nombre);
  if (nombre.length === 0) {
    errors.nombre = "Decinos cómo te llamás.";
  } else if (nombre.length > MAX_NOMBRE || excedeCodificado(nombre, MAX_TEXTO_CORTO_CODIFICADO)) {
    errors.nombre = MSG_MUY_LARGO;
  }

  const digitos = digitosTelefono(values.telefono);
  if (digitos === 0) {
    errors.telefono = "Dejanos un teléfono para responderte.";
  } else if (digitos === -1) {
    errors.telefono = "El teléfono solo puede tener números, espacios y los signos + - ( ).";
  } else if (digitos < 8 || digitos > 15) {
    errors.telefono = "El teléfono tiene que tener entre 8 y 15 números.";
  }

  const fields = FIELD_ORDER.filter((name) => errors[name]);
  return { valid: fields.length === 0, errors, fields };
}
