import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import content from "@/data/content.json";

const ID = "por-que";

/** Ventajas. Todo el texto sale de content.json: nada hardcodeado aca. */
export default function WhyUs() {
  const { eyebrow, title, subtitle } = content.headings.whyUs;

  return (
    <Section id={ID} className="relative overflow-hidden bg-brand-navy text-white">
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-24 size-80 rounded-full bg-brand-blue/20 blur-3xl"
      />

      <div className="relative">
        <SectionHeading
          id={ID}
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          tone="dark"
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.advantages.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={(index % 3) * 90}
              className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-[2px]"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
                <Icon name={item.icon} className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-brand-mist sm:text-base">
                {item.text}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}
