import content from "../data/content.json" with { type: "json" };
import events from "../data/events.json" with { type: "json" };

/**
 * Anclas de la navbar y del footer.
 *
 * Dos secciones son condicionales y sus links tampoco existen si la seccion no
 * esta:
 *   - testimonios (D4c del PLAN): si no hay reseñas reales con permiso,
 *     `content.testimonials` queda en `[]`;
 *   - eventos: si `data/eventos.xlsx` no tiene ningun evento activo,
 *     `events.json` queda en `[]`.
 *
 * El link de eventos se decide en el build, con el JSON completo. El descarte
 * de los eventos que ya pasaron corre despues, en el cliente (no se puede leer
 * la fecha actual en el prerender), asi que si TODOS los eventos cargados
 * quedaron viejos el link sigue en el menu aunque la seccion se oculte. Por eso
 * la planilla pide borrar las filas pasadas.
 */
export function navItems(data = content, eventos = events) {
  const items = [
    { href: "#servicios", label: "Servicios" },
    { href: "#como-funciona", label: "Cómo funciona" },
  ];

  if (Array.isArray(eventos) && eventos.length > 0) {
    items.push({ href: "#eventos", label: "Eventos" });
  }

  items.push({ href: "#por-que", label: "Por qué elegirnos" });

  if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
    items.push({ href: "#opiniones", label: "Opiniones" });
  }

  items.push({ href: "#faq", label: "Preguntas" }, { href: "#cotizar", label: "Cotizar" });
  return items;
}
