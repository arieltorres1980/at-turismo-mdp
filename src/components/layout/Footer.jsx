import { MapPin, Phone } from "lucide-react";

import Container from "@/components/ui/Container";
import CurrentYear from "@/components/ui/CurrentYear";
import Logo from "@/components/ui/Logo";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import content from "@/data/content.json";
import { contact, emailHref, hasValue, instagramUrl, telHref, waLink } from "@/lib/contact";

const LINK = "text-brand-mist transition-colors hover:text-white";

export default function Footer({ items = [] }) {
  const tel = telHref();
  const instagram = instagramUrl();
  const mail = emailHref();
  const licencia = contact.legal?.license;
  const localidad = contact.address?.locality;
  const region = contact.address?.region;

  return (
    <footer className="bg-brand-navy-deep text-brand-mist">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={48} className="size-12" />
              <span className="font-display text-lg font-bold text-white">
                {contact.businessName}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{content.footer.about}</p>
          </div>

          <nav aria-label="Pie de página">
            <h2 className="text-sm font-semibold tracking-[0.14em] text-white uppercase">
              {content.footer.navTitle}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={LINK}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.14em] text-white uppercase">
              {content.footer.contactTitle}
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {tel ? (
                <li>
                  <a href={tel} className={`inline-flex items-center gap-2 ${LINK}`}>
                    <Phone className="size-4 shrink-0" aria-hidden="true" />
                    {contact.phone.display}
                  </a>
                </li>
              ) : null}
              <li>
                <a
                  href={waLink(contact.whatsapp.defaultMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 ${LINK}`}
                >
                  <WhatsAppIcon className="size-4 shrink-0" />
                  WhatsApp
                </a>
              </li>
              {instagram ? (
                <li>
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 ${LINK}`}
                  >
                    <InstagramIcon className="size-4 shrink-0" />
                    {`@${contact.instagram.user}`}
                  </a>
                </li>
              ) : null}
              {mail ? (
                <li>
                  <a href={mail} className={LINK}>
                    {contact.email}
                  </a>
                </li>
              ) : null}
              {hasValue(localidad) ? (
                <li className="inline-flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" aria-hidden="true" />
                  <span>{hasValue(region) ? `${localidad}, ${region}` : localidad}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs leading-relaxed">
          <p>{content.footer.disclaimer}</p>
          {hasValue(licencia) ? <p className="mt-2">{licencia}</p> : null}
          <p className="mt-3">
            © <CurrentYear /> {contact.businessName}. {contact.tagline}.
          </p>
        </div>
      </Container>
    </footer>
  );
}
