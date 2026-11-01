import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import content from "@/data/content.json";

const ID = "opiniones";

/**
 * Testimonios. Seccion CONDICIONAL (D4c del PLAN): mientras no haya reseñas
 * reales con permiso de publicacion, `content.testimonials` queda en `[]` y
 * esta seccion no existe en el HTML. Prohibido inventar testimonios.
 *
 * Tampoco se marcan nunca con `Review` / `AggregateRating` en el JSON-LD:
 * Google no admite reseñas propias del negocio.
 */
export default function Testimonials() {
  const items = content.testimonials;
  if (!Array.isArray(items) || items.length === 0) return null;

  const { eyebrow, title } = content.headings.testimonials;

  return (
    <Section id={ID} className="bg-surface">
      <SectionHeading id={ID} eyebrow={eyebrow} title={title} />

      <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <Reveal
            as="li"
            key={`${item.name}-${index}`}
            delay={(index % 3) * 90}
            className="h-full rounded-2xl border border-slate-200 bg-surface-soft p-6"
          >
            <blockquote className="text-sm leading-relaxed text-pretty text-ink sm:text-base">
              {item.text}
            </blockquote>
            <p className="mt-4 text-sm font-semibold text-brand-navy">{item.name}</p>
            {item.detail ? (
              <p className="text-xs text-ink-soft">{item.detail}</p>
            ) : null}
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
