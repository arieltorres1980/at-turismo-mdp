"use client";

import useClientValue from "@/lib/useClientValue";

/**
 * Año del copyright.
 *
 * Se resuelve en el cliente a proposito: con `cacheComponents: true` un
 * `new Date()` durante el prerender rompe el build (ver R3 del PLAN y
 * `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`).
 * En el HTML prerenderizado el año sale vacio y se completa al hidratar, sin
 * mismatch.
 */
const getYear = () => String(new Date().getFullYear());

export default function CurrentYear() {
  return <span>{useClientValue(getYear, "")}</span>;
}
