import { MapPin, Phone } from "lucide-react";

import QuoteForm from "@/components/sections/QuoteForm";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import content from "@/data/content.json";
import { contact, emailHref, hasValue, instagramUrl, telHref, waLink } from "@/lib/contact";

const ID = "cotizar";

const CARD =
  "flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:text-base";

export default function Contact() {
  const { eyebrow, title, subtitle } = content.headings.contact;
  const tel = telHref();
  const instagram = instagramUrl();
  const mail = emailHref();
  const localidad = contact.address?.locality;
  const region = contact.address?.region;

  return (
    <Section id={ID} className="bg-brand-black">
      <SectionHeading id={ID} eyebrow={eyebrow} title={title} subtitle={subtitle} tone="dark" />

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_1.35fr]">
        <Reveal variant="left" className="text-white">
          <h3 className="font-display text-2xl font-bold">{content.contact.asideTitle}</h3>
          <p className="mt-3 text-sm leading-relaxed text-pretty text-brand-mist sm:text-base">
            {content.contact.asideText}
          </p>

          <ul className="mt-6 space-y-3">
            <li>
              <a
                href={waLink(contact.whatsapp.defaultMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={CARD}
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-whatsapp text-brand-black">
                  <WhatsAppIcon className="size-5" />
                </span>
                WhatsApp
              </a>
            </li>

            {tel ? (
              <li>
                <a href={tel} className={CARD}>
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-black">
                    <Phone className="size-5" aria-hidden="true" />
                  </span>
                  {contact.phone.display}
                </a>
              </li>
            ) : null}

            {instagram ? (
              <li>
                <a href={instagram} target="_blank" rel="noopener noreferrer" className={CARD}>
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
                    <InstagramIcon className="size-5" />
                  </span>
                  {`@${contact.instagram.user}`}
                </a>
              </li>
            ) : null}

            {mail ? (
              <li>
                <a href={mail} className={CARD}>
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
                    <span aria-hidden="true">@</span>
                  </span>
                  {contact.email}
                </a>
              </li>
            ) : null}

            {hasValue(localidad) ? (
              <li className="flex items-center gap-3 px-4 py-3 text-sm text-brand-mist sm:text-base">
                <MapPin className="size-5 shrink-0" aria-hidden="true" />
                {hasValue(region) ? `${localidad}, ${region}` : localidad}
              </li>
            ) : null}
          </ul>
        </Reveal>

        <Reveal variant="right" className="rounded-2xl bg-surface p-5 shadow-xl sm:p-8">
          <h3 className="font-display text-2xl font-bold text-brand-navy">
            {content.contact.formTitle}
          </h3>
          <div className="mt-6">
            <QuoteForm />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
