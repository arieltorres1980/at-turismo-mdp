import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import content from "@/data/content.json";

const ID = "servicios";

/** Grilla de servicios. Agregar un item al JSON agrega una card. */
export default function Services() {
  const { eyebrow, title, subtitle } = content.headings.services;

  return (
    <Section id={ID} className="bg-surface">
      <SectionHeading id={ID} eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {content.services.map((service, index) => (
          <Reveal
            as="li"
            key={service.title}
            delay={(index % 3) * 90}
            className="group h-full rounded-2xl border border-slate-200 bg-surface p-6 shadow-sm transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:border-brand-blue/40 hover:shadow-lg"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-surface-soft text-brand-blue-deep transition-colors duration-300 group-hover:bg-brand-navy group-hover:text-brand-gold">
              <Icon name={service.icon} className="size-6" />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold text-brand-navy">
              {service.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-soft sm:text-base">
              {service.text}
            </p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
