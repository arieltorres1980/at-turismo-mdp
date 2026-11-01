/**
 * CTA. SIEMPRE renderiza un `<a>`: nunca un `<button>` adentro de un `<a>`
 * (HTML invalido y foco duplicado).
 *
 * `external` agrega `target="_blank" rel="noopener noreferrer"`.
 */
const VARIANTS = {
  primary:
    "bg-brand-blue text-white hover:bg-brand-blue-deep active:bg-brand-navy shadow-sm shadow-brand-navy/20",
  gold: "bg-brand-gold text-brand-black hover:bg-brand-gold-deep hover:text-white",
  outline:
    "border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white",
  outlineLight:
    "border-2 border-white/70 text-white hover:bg-white hover:text-brand-navy",
};

const SIZES = {
  md: "px-5 py-3 text-sm sm:text-base",
  lg: "px-6 py-3.5 text-base sm:text-lg",
};

export default function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  external = false,
  className = "",
  children,
  ...rest
}) {
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a
      href={href}
      {...externalProps}
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 ${
        VARIANTS[variant] ?? VARIANTS.primary
      } ${SIZES[size] ?? SIZES.md} ${className}`}
    >
      {children}
    </a>
  );
}
