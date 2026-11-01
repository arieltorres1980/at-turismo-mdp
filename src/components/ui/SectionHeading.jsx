import Reveal from "./Reveal";

/**
 * Encabezado de seccion. El `<h2>` lleva el id que consume el
 * `aria-labelledby` de `Section`.
 *
 * `tone="dark"` es para fondos oscuros (navy / negro de marca).
 */
export default function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
  tone = "light",
  align = "center",
  className = "",
}) {
  const dark = tone === "dark";
  const centered = align === "center";

  return (
    <Reveal
      className={`${centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}
    >
      {eyebrow ? (
        <p
          className={`mb-3 text-xs font-semibold tracking-[0.18em] uppercase ${
            dark ? "text-brand-gold" : "text-brand-blue-deep"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}

      <h2
        id={id ? `${id}-titulo` : undefined}
        className={`font-display text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-[2.75rem] ${
          dark ? "text-white" : "text-brand-navy"
        }`}
      >
        {title}
      </h2>

      {subtitle ? (
        <p
          className={`mt-4 text-base leading-relaxed text-pretty sm:text-lg ${
            dark ? "text-brand-mist" : "text-ink-soft"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
