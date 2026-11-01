"use client";

import { useEffect, useRef } from "react";

/**
 * Animacion de entrada al hacer scroll, con IntersectionObserver propio
 * (sin librerias de animacion).
 *
 * Mejora progresiva: el estado oculto vive en `globals.css` bajo el selector
 * `.js [data-reveal]`. La clase `js` la pone un script inline del layout, asi
 * que SIN JavaScript el contenido se ve siempre (y los crawlers lo leen).
 *
 * `prefers-reduced-motion: reduce` anula la transicion en CSS; aca ademas se
 * revela todo de una, sin esperar al observer.
 */
export default function Reveal({
  as: Tag = "div",
  variant = "up",
  delay = 0,
  once = true,
  className = "",
  children,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || typeof IntersectionObserver === "undefined") {
      node.dataset.revealed = "true";
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.dataset.revealed = "true";
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.dataset.revealed = "false";
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
