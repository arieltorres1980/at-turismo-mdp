import content from "../data/content.json" with { type: "json" };

/**
 * Anclas de la navbar y del footer.
 *
 * La seccion de testimonios es condicional (D4c del PLAN): si no hay reseñas
 * reales con permiso, ni la seccion ni su link existen en el HTML.
 */
export function navItems(data = content) {
  const items = [
    { href: "#servicios", label: "Servicios" },
    { href: "#como-funciona", label: "Cómo funciona" },
    { href: "#por-que", label: "Por qué elegirnos" },
  ];

  if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
    items.push({ href: "#opiniones", label: "Opiniones" });
  }

  items.push({ href: "#faq", label: "Preguntas" }, { href: "#cotizar", label: "Cotizar" });
  return items;
}
