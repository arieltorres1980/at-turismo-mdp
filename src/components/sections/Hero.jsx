import { getImageProps } from "next/image";
import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";
import Icon from "@/components/ui/Icon";
import Waves from "@/components/ui/Waves";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import content from "@/data/content.json";
import { contact, waLink } from "@/lib/contact";

/**
 * Hero.
 *
 * El `<h1>` NO se anima con opacidad: seria el LCP y arrancar en `opacity: 0`
 * retrasa la metrica. Lo que entra con animacion son los elementos
 * secundarios (`.hero-rise`), y todo se desactiva con reduced-motion.
 */
export default function Hero() {
  const { hero } = content;

  // Art direction: foto vertical en movil, horizontal desde tablet (md).
  // Es decorativa (`alt=""`) y es la imagen LCP candidata, por eso `priority`.
  const comunes = { alt: "", fill: true, sizes: "100vw", priority: true };
  const {
    props: { srcSet: srcSetHorizontal },
  } = getImageProps({ ...comunes, src: "/images/PortadaHorizontal.webp" });
  const {
    props: { srcSet: srcSetVertical, ...imgProps },
  } = getImageProps({ ...comunes, src: "/images/PortadaVertical.webp" });
  const [antes, despues] = hero.titleHighlight
    ? hero.title.split(hero.titleHighlight)
    : [hero.title, ""];

  return (
    <section
      id="inicio"
      aria-labelledby="inicio-titulo"
      className="relative isolate overflow-hidden bg-brand-navy-deep text-white"
    >
      <picture className="absolute inset-0 -z-20 block">
        <source media="(min-width: 768px)" srcSet={srcSetHorizontal} />
        <source srcSet={srcSetVertical} />
        <img {...imgProps} alt="" className="size-full object-cover" />
      </picture>
      {/* Capa oscura: las fotos son claras y el texto blanco necesita contraste (AA). */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-navy-deep/50" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-brand-navy/50 via-transparent to-brand-black/70"
      />
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-brand-blue/25 blur-3xl sm:size-96 motion-safe:animate-float-soft"
      />

      <Container className="relative pt-14 pb-28 sm:pt-20 sm:pb-36 lg:pt-28 lg:pb-44">
        <div className="max-w-3xl">
          <p
            className="hero-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-brand-gold uppercase sm:text-sm"
            style={{ "--rise-delay": "0ms" }}
          >
            {hero.eyebrow}
          </p>

          <h1
            id="inicio-titulo"
            className="mt-6 font-display text-4xl leading-[1.08] font-bold text-balance sm:text-5xl lg:text-6xl"
          >
            {antes}
            {hero.titleHighlight ? (
              <span className="text-brand-gold">{hero.titleHighlight}</span>
            ) : null}
            {despues}
          </h1>

          <p
            className="hero-rise mt-6 max-w-2xl text-base leading-relaxed text-pretty text-brand-mist sm:text-lg"
            style={{ "--rise-delay": "120ms" }}
          >
            {hero.subtitle}
          </p>

          <div
            className="hero-rise mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap"
            style={{ "--rise-delay": "220ms" }}
          >
            <ButtonLink href="#cotizar" variant="gold" size="lg">
              {hero.primaryCta}
            </ButtonLink>
            <ButtonLink
              href={waLink(contact.whatsapp.defaultMessage)}
              variant="outlineLight"
              size="lg"
              external
            >
              <WhatsAppIcon className="size-5" />
              {hero.secondaryCta}
            </ButtonLink>
          </div>

          <ul
            className="hero-rise mt-10 grid gap-3 text-sm sm:grid-cols-3 sm:text-base"
            style={{ "--rise-delay": "320ms" }}
          >
            {hero.highlights.map((item) => (
              <li key={item.text} className="flex items-center gap-2.5 text-brand-mist">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-gold">
                  <Icon name={item.icon} className="size-4.5" />
                </span>
                <span className="text-pretty">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <Waves />
    </section>
  );
}
