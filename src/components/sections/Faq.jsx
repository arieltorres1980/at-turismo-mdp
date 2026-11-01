import { ChevronDown } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import content from "@/data/content.json";

const ID = "faq";

/**
 * Preguntas frecuentes con `<details>/<summary>` nativo: abre y cierra con
 * teclado y funciona sin JavaScript.
 */
export default function Faq() {
  const { eyebrow, title, subtitle } = content.headings.faq;

  return (
    <Section id={ID} className="bg-surface-soft">
      <SectionHeading id={ID} eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {content.faq.map((item, index) => (
          <Reveal key={item.q} delay={Math.min(index, 4) * 70}>
            <details className="group rounded-2xl border border-slate-200 bg-surface px-5 open:border-brand-blue/40 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-brand-navy marker:content-none">
                <span className="text-pretty">{item.q}</span>
                <ChevronDown
                  className="size-5 shrink-0 text-brand-blue-deep transition-transform duration-300 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-pretty text-ink-soft sm:text-base">
                {item.a}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
