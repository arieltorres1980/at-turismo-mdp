import test from "node:test";
import assert from "node:assert/strict";

import { openExternal } from "../src/lib/openExternal.js";

const URL_WA = "https://wa.me/5492235719924?text=hola";

test("abre en _blank sin el feature `noopener` (que forzaria un null siempre)", () => {
  const llamadas = [];
  const open = (...args) => {
    llamadas.push(args);
    return {};
  };

  assert.equal(openExternal(URL_WA, open), true);
  assert.equal(llamadas.length, 1);
  assert.deepEqual(llamadas[0], [URL_WA, "_blank"]);
});

test("corta el `opener` de la pestana abierta", () => {
  const ventana = { opener: { secreto: true } };

  assert.equal(openExternal(URL_WA, () => ventana), true);
  assert.equal(ventana.opener, null);
});

test("devuelve true aunque no se pueda escribir `opener`", () => {
  const ventana = {
    set opener(_valor) {
      throw new Error("cross-origin");
    },
  };

  assert.equal(openExternal(URL_WA, () => ventana), true);
});

test("devuelve false solo si el popup fue bloqueado", () => {
  assert.equal(openExternal(URL_WA, () => null), false);
  assert.equal(openExternal(URL_WA, () => undefined), false);
});

test("devuelve false si `open` lanza o no existe", () => {
  assert.equal(
    openExternal(URL_WA, () => {
      throw new Error("bloqueado");
    }),
    false,
  );
  assert.equal(openExternal(URL_WA, null), false);
  assert.equal(openExternal(URL_WA, "no soy una funcion"), false);
});

test("una url vacia o no-string no intenta abrir nada", () => {
  let llamado = false;
  const open = () => {
    llamado = true;
    return {};
  };

  assert.equal(openExternal("", open), false);
  assert.equal(openExternal(undefined, open), false);
  assert.equal(llamado, false);
});
