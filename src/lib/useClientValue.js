"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Devuelve un valor que SOLO existe en el cliente (tipicamente derivado de la
 * fecha actual), sin provocar mismatch de hidratacion y sin `setState` dentro
 * de un efecto (lo prohibe `react-hooks/set-state-in-effect`).
 *
 * En el servidor y en el primer render del cliente devuelve `serverValue`;
 * despues de la hidratacion, lo que devuelva `getSnapshot`.
 *
 * `getSnapshot` tiene que ser estable: devolver el mismo valor en llamadas
 * seguidas, o React vuelve a renderizar en bucle.
 */
export default function useClientValue(getSnapshot, serverValue) {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverValue);
}
