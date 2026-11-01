import { MapPin } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import content from "@/data/content.json";

const ID = "como-funciona";

/** Pasos numerados (`<ol>` semantico) + chips de destinos frecuentes. */
export default function HowItWorks() {
  const { eyebrow, title, subtitle } = content.headings.howItWorks;

  return (
    <Section id={ID} className="bg-surface-soft">
      <SectionHeading id={ID} eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {content.steps.map((step, index) => (
          <Reveal
            as="li"
            key={step.title}
            delay={index * 110}
            className="relative h-full rounded-2xl border border-slate-200 bg-surface p-6 pt-10"
          >
            <span
              aria-hidden="true"
              className="absolute -top-5 left-6 inline-flex size-11 items-center justify-center rounded-full bg-brand-navy font-display text-lg font-bold text-brand-gold shadow-md"
            >
              {index + 1}
            </span>
            <h3 className="font-display text-xl font-bold text-brand-navy">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-soft sm:text-base">
              {step.text}
            </p>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mt-14 rounded-2xl border border-slate-200 bg-surface p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold text-brand-navy sm:text-2xl">
          {content.headings.destinations.title}
        </h3>
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {content.destinations.map((destino) => (
            <li
              key={destino}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3.5 py-2 text-sm font-medium text-brand-blue-deep"
            >
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {destino}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
