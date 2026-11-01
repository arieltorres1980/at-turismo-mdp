import Container from "./Container";

/**
 * Seccion con ancla y nombre accesible.
 * `id` sirve de destino de la navbar y `aria-labelledby` apunta al titulo,
 * que lo renderiza SectionHeading con el id `${id}-titulo`.
 */
export default function Section({ id, className = "", containerClassName = "", children }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-titulo` : undefined} className={`py-16 sm:py-20 lg:py-24 ${className}`}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
